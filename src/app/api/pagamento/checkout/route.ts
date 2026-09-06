import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import { rateLimit } from "@/lib/rate-limit";
import { normalizarCpfCnpj, soDigitos } from "@/lib/documento";
import {
  ehCiclo,
  ehPlanoPago,
  PLANO_LABEL,
  precoCentavos,
  type Ciclo,
  type PlanoPago,
} from "@/lib/planos";
import {
  asaasConfigurado,
  asaasConfigurarNfseAssinatura,
  asaasCriarAssinatura,
  asaasCriarCliente,
  asaasErroDescricao,
  AsaasError,
  asaasPagamentosDaAssinatura,
  asaasPixQrCode,
  type AsaasBillingType,
} from "@/lib/asaas";
import { nfseConfig, nfseHabilitado } from "@/lib/nfse";

// Checkout do Clube +HCE (BAC_143, Fase 2). Cria/reusa o cliente no Asaas,
// abre a assinatura recorrente (Pix ou cartao) e devolve ao front o meio de
// pagamento: QR Pix (copia-e-cola) ou a URL da fatura hospedada (cartao).
//
// Principios:
// - Valor NUNCA vem do cliente: resolvido no servidor por (plano, ciclo).
// - `plano` do usuario so sobe para pago quando o webhook confirmar (Fase 3);
//   aqui deixamos a assinatura como "trial" (aguardando 1o pagamento).
// - Idempotencia: cobranca gravada por asaasPaymentId (unique); assinatura
//   ativa/trial existente bloqueia nova compra.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  plano: z.string(),
  ciclo: z.string(),
  metodo: z.enum(["PIX", "CREDIT_CARD"]),
  cpfCnpj: z.string().min(11).max(20),
});

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Faça login para assinar.", code: "NAO_AUTENTICADO" },
      { status: 401 },
    );
  }
  if (!user.emailVerificado) {
    return NextResponse.json(
      { error: "Confirme seu e-mail antes de assinar.", code: "EMAIL_NAO_VERIFICADO" },
      { status: 403 },
    );
  }

  const rl = await rateLimit(`checkout:${user.id}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  if (!asaasConfigurado()) {
    return NextResponse.json(
      { error: "Pagamentos indisponíveis no momento." },
      { status: 503 },
    );
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (!ehPlanoPago(data.plano)) {
    return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
  }
  if (!ehCiclo(data.ciclo)) {
    return NextResponse.json({ error: "Ciclo inválido." }, { status: 400 });
  }
  const plano: PlanoPago = data.plano;
  const ciclo: Ciclo = data.ciclo;
  const metodo: AsaasBillingType = data.metodo;

  const cpfCnpj = normalizarCpfCnpj(data.cpfCnpj);
  if (!cpfCnpj) {
    return NextResponse.json(
      { error: "CPF/CNPJ inválido." },
      { status: 400 },
    );
  }

  // Ja possui assinatura em andamento? Evita cobranca duplicada.
  const emAndamento = await prisma.assinatura.findFirst({
    where: { userId: user.id, status: { in: ["trial", "ativa"] } },
  });
  if (emAndamento) {
    return NextResponse.json(
      {
        error: "Você já possui uma assinatura em andamento.",
        code: "JA_ASSINANTE",
      },
      { status: 409 },
    );
  }

  const valorCentavos = precoCentavos(plano, ciclo);
  const valorReais = Math.round(valorCentavos) / 100;

  // Dados atuais do usuario (nome/telefone/cliente Asaas).
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  try {
    // 1) Cliente no Asaas (reusa se ja existir).
    let asaasCustomerId = dbUser.asaasCustomerId;
    if (!asaasCustomerId) {
      const cliente = await asaasCriarCliente({
        name: dbUser.name ?? user.nome ?? "Cliente HCE",
        email: dbUser.email ?? user.email ?? "",
        cpfCnpj,
        mobilePhone: dbUser.telefone ? soDigitos(dbUser.telefone) : undefined,
        externalReference: user.id,
      });
      asaasCustomerId = cliente.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { asaasCustomerId },
      });
    }

    // 2) Assinatura recorrente mensal.
    const descricao = `Clube +HCE — ${PLANO_LABEL[plano]} (${ciclo})`;
    const sub = await asaasCriarAssinatura({
      customer: asaasCustomerId,
      billingType: metodo,
      value: valorReais,
      nextDueDate: hojeISO(),
      cycle: "MONTHLY",
      description: descricao,
      externalReference: user.id,
    });

    // 3) Persiste a assinatura local (status trial ate o webhook confirmar).
    const assinatura = await prisma.assinatura.create({
      data: {
        userId: user.id,
        plano,
        provedor: "asaas",
        asaasCustomerId,
        asaasSubscriptionId: sub.id,
        status: "trial",
        metodo,
        valorCentavos,
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { statusAssinatura: "trial" },
    });

    // 3.1) NFS-e automatica por cobranca (BAC_144) — so quando ligada por flag
    // e com os dados fiscais definidos. Best-effort: nunca quebra o checkout.
    if (nfseHabilitado()) {
      const c = nfseConfig();
      await asaasConfigurarNfseAssinatura(sub.id, {
        municipalServiceCode: c.serviceCode,
        municipalServiceName: c.serviceName,
        deductions: c.deductions,
        effectiveDatePeriod: "ON_PAYMENT_CONFIRMATION",
        receivedOnly: false,
        observations: c.observations || undefined,
        taxes: {
          retainIss: c.retainIss,
          iss: c.iss,
          cofins: 0,
          csll: 0,
          inss: 0,
          ir: 0,
          pis: 0,
        },
      }).catch((e) => {
        console.error("[checkout] falha ao configurar NFS-e", e);
      });
    }

    // 4) 1a cobranca gerada pela assinatura (Pix: QR; cartao: fatura hospedada).
    const pagamentos = await asaasPagamentosDaAssinatura(sub.id);
    const primeira = pagamentos[0];

    if (primeira) {
      await prisma.pagamento.upsert({
        where: { asaasPaymentId: primeira.id },
        create: {
          assinaturaId: assinatura.id,
          userId: user.id,
          provedor: "asaas",
          asaasPaymentId: primeira.id,
          valorCentavos,
          metodo,
          status: primeira.status ?? "PENDING",
        },
        update: { status: primeira.status ?? "PENDING" },
      });
    }

    // 5) Monta a resposta conforme o metodo.
    if (metodo === "PIX" && primeira) {
      const qr = await asaasPixQrCode(primeira.id);
      return NextResponse.json({
        ok: true,
        metodo,
        assinaturaId: assinatura.id,
        invoiceUrl: primeira.invoiceUrl ?? null,
        pix: qr
          ? {
              imagemBase64: qr.encodedImage,
              copiaECola: qr.payload,
              expiraEm: qr.expirationDate ?? null,
            }
          : null,
      });
    }

    // Cartao (ou Pix sem QR ainda): manda para a fatura hospedada do Asaas.
    return NextResponse.json({
      ok: true,
      metodo,
      assinaturaId: assinatura.id,
      invoiceUrl: primeira?.invoiceUrl ?? null,
    });
  } catch (e) {
    if (e instanceof AsaasError) {
      const desc = asaasErroDescricao(e.body);
      console.error("[checkout] Asaas", e.status, JSON.stringify(e.body));
      return NextResponse.json(
        {
          error:
            desc ?? "Não foi possível iniciar o pagamento. Tente novamente.",
        },
        { status: 502 },
      );
    }
    console.error("[checkout] erro", e);
    return NextResponse.json(
      { error: "Erro inesperado ao iniciar o pagamento." },
      { status: 500 },
    );
  }
}
