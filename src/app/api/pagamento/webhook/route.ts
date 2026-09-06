import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { webhookTokenValido } from "@/lib/asaas";
import { appUrl, emailConfigured, sendEmail } from "@/lib/email";
import { PLANO_LABEL, type Plano } from "@/lib/planos";

// Webhook do Asaas (BAC_143, Fase 3). Mantem o acesso em dia com o pagamento,
// automaticamente. O Asaas chama esta rota a cada evento de cobranca/assinatura.
//
// Seguranca e robustez:
// - Autenticidade: header `asaas-access-token` comparado com ASAAS_WEBHOOK_TOKEN
//   (falha fechada — sem token configurado, rejeita).
// - Idempotencia: gravamos o Pagamento por `asaasPaymentId` (unique) via upsert
//   e as transicoes de status sao idempotentes (reprocessar o mesmo evento leva
//   ao mesmo estado). Sempre respondemos 200 nos eventos conhecidos para o
//   Asaas nao ficar reenfileirando.
//
// Ciclo de vida (status da Assinatura e do User.statusAssinatura):
//   trial -> ativa (pagamento confirmado/recebido)
//   ativa -> inadimplente (OVERDUE)   [corta acesso: plano volta a free]
//   *     -> cancelada (estorno/chargeback/exclusao)
// O `plano` do User (fonte do gating) sobe para o plano da assinatura quando
// ativa e cai para "free" quando inadimplente/cancelada.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Eventos que LIBERAM o acesso.
const EVENTOS_CONFIRMA = new Set([
  "PAYMENT_CONFIRMED",
  "PAYMENT_RECEIVED",
  "PAYMENT_RECEIVED_IN_CASH",
  "PAYMENT_DUNNING_RECEIVED",
]);
// Eventos de inadimplencia (vencido/estornado por atraso).
const EVENTOS_OVERDUE = new Set(["PAYMENT_OVERDUE"]);
// Eventos que REVOGAM o acesso (dinheiro devolvido/contestado/excluido).
const EVENTOS_REVOGA = new Set([
  "PAYMENT_REFUNDED",
  "PAYMENT_REFUND_IN_PROGRESS",
  "PAYMENT_CHARGEBACK_REQUESTED",
  "PAYMENT_CHARGEBACK_DISPUTE",
  "PAYMENT_AWAITING_CHARGEBACK_REVERSAL",
  "PAYMENT_DELETED",
]);
// Eventos de assinatura que encerram o vinculo.
const EVENTOS_SUB_ENCERRA = new Set([
  "SUBSCRIPTION_DELETED",
  "SUBSCRIPTION_INACTIVATED",
]);
// Eventos de nota fiscal (NFS-e) -> status local da NotaFiscal.
const EVENTOS_NOTA: Record<string, "emitida" | "erro" | "cancelada"> = {
  INVOICE_AUTHORIZED: "emitida",
  INVOICE_ERROR: "erro",
  INVOICE_CANCELED: "cancelada",
};

type AsaasWebhookPayment = {
  id: string;
  customer?: string;
  subscription?: string;
  value?: number;
  status?: string;
  billingType?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  confirmedDate?: string;
};

type AsaasWebhookInvoice = {
  id: string;
  payment?: string;
  subscription?: string;
  customer?: string;
  status?: string;
  number?: string;
  pdfUrl?: string;
  xmlUrl?: string;
};

type AsaasWebhookBody = {
  event?: string;
  payment?: AsaasWebhookPayment;
  subscription?: { id?: string };
  invoice?: AsaasWebhookInvoice;
};

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export async function POST(req: Request) {
  // 1) Autenticidade.
  const token = req.headers.get("asaas-access-token");
  if (!webhookTokenValido(token)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // 2) Corpo.
  let body: AsaasWebhookBody;
  try {
    body = (await req.json()) as AsaasWebhookBody;
  } catch {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const evento = body.event ?? "";
  const pag = body.payment;

  try {
    // --- Eventos de nota fiscal (NFS-e): grava/atualiza a NotaFiscal. ---
    if (evento.startsWith("INVOICE_")) {
      await processarNota(body.invoice, evento);
      return NextResponse.json({ ok: true });
    }

    // --- Eventos de assinatura (sem payment): encerramento direto. ---
    if (!pag && EVENTOS_SUB_ENCERRA.has(evento)) {
      const subId = body.subscription?.id;
      if (subId) await encerrarAssinatura(subId);
      return NextResponse.json({ ok: true });
    }

    // Sem cobranca associada: nada a fazer (ex.: PAYMENT_CREATED de terceiros).
    if (!pag?.id) return NextResponse.json({ ok: true });

    // 3) Resolve assinatura (por subscription) e usuario (por assinatura ou
    //    por cliente Asaas). Precisamos do userId para gravar o Pagamento.
    const assinatura = pag.subscription
      ? await prisma.assinatura.findUnique({
          where: { asaasSubscriptionId: pag.subscription },
        })
      : null;

    let userId = assinatura?.userId ?? null;
    if (!userId && pag.customer) {
      const u = await prisma.user.findUnique({
        where: { asaasCustomerId: pag.customer },
      });
      userId = u?.id ?? null;
    }

    // Cobranca de um cliente que nao conhecemos: registra e sai (200).
    if (!userId) {
      console.warn("[webhook] pagamento sem usuario conhecido", pag.id, evento);
      return NextResponse.json({ ok: true });
    }

    const confirma = EVENTOS_CONFIRMA.has(evento);
    // 1a ativação = estava aguardando (trial) e agora confirmou. Usado para
    // mandar boas-vindas só uma vez (não a cada renovação mensal).
    const primeiraAtivacao =
      confirma && !!assinatura && assinatura.status !== "ativa";
    const valorCentavos =
      typeof pag.value === "number" ? Math.round(pag.value * 100) : undefined;

    // 4) Idempotente: grava/atualiza o Pagamento por asaasPaymentId.
    await prisma.pagamento.upsert({
      where: { asaasPaymentId: pag.id },
      create: {
        assinaturaId: assinatura?.id ?? null,
        userId,
        provedor: "asaas",
        asaasPaymentId: pag.id,
        valorCentavos: valorCentavos ?? assinatura?.valorCentavos ?? 0,
        metodo: pag.billingType ?? assinatura?.metodo ?? null,
        status: pag.status ?? evento,
        pagoEm: confirma ? new Date() : null,
      },
      update: {
        status: pag.status ?? evento,
        ...(confirma ? { pagoEm: new Date() } : {}),
        ...(valorCentavos ? { valorCentavos } : {}),
      },
    });

    // 5) Aplica a transicao de estado no User (e na Assinatura, se houver).
    if (confirma) {
      const plano = assinatura?.plano;
      await prisma.user.update({
        where: { id: userId },
        data: {
          statusAssinatura: "ativa",
          ...(plano ? { plano } : {}),
        },
      });
      if (assinatura) {
        await prisma.assinatura.update({
          where: { id: assinatura.id },
          data: {
            status: "ativa",
            fimPeriodoAtual: addMonths(new Date(), 1),
          },
        });
      }
      // Boas-vindas só na 1a ativação (best-effort, nunca quebra o webhook).
      if (primeiraAtivacao) {
        await enviarBoasVindas(
          userId,
          assinatura?.plano,
          valorCentavos ?? assinatura?.valorCentavos ?? undefined,
        ).catch(() => null);
      }
    } else if (EVENTOS_OVERDUE.has(evento)) {
      await prisma.user.update({
        where: { id: userId },
        data: { statusAssinatura: "inadimplente", plano: "free" },
      });
      if (assinatura) {
        await prisma.assinatura.update({
          where: { id: assinatura.id },
          data: { status: "inadimplente" },
        });
      }
    } else if (EVENTOS_REVOGA.has(evento)) {
      await prisma.user.update({
        where: { id: userId },
        data: { statusAssinatura: "cancelada", plano: "free" },
      });
      if (assinatura) {
        await prisma.assinatura.update({
          where: { id: assinatura.id },
          data: { status: "cancelada", canceladaEm: new Date() },
        });
      }
    }
    // Demais eventos (PAYMENT_CREATED/UPDATED/etc.): so registramos acima.

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Erro nosso: responde 200 para o Asaas nao reenfileirar em loop, mas
    // registra para investigacao (Sentry pega o console.error).
    console.error("[webhook] erro ao processar", evento, e);
    return NextResponse.json({ ok: true });
  }
}

// Encerra a assinatura e rebaixa o usuario para free.
async function encerrarAssinatura(asaasSubscriptionId: string): Promise<void> {
  const assinatura = await prisma.assinatura.findUnique({
    where: { asaasSubscriptionId },
  });
  if (!assinatura) return;
  await prisma.assinatura.update({
    where: { id: assinatura.id },
    data: { status: "cancelada", canceladaEm: new Date() },
  });
  await prisma.user.update({
    where: { id: assinatura.userId },
    data: { statusAssinatura: "cancelada", plano: "free" },
  });
}

// E-mail de boas-vindas ao assinante (Fase 4 — parte de e-mail, BAC_145).
// Reaproveita o utilitário Brevo já usado na recuperação de senha.
async function enviarBoasVindas(
  userId: string,
  plano: string | undefined,
  valorCentavos: number | undefined,
): Promise<void> {
  if (!emailConfigured()) return;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!u?.email) return;

  const primeiro = (u.name ?? "").trim().split(" ")[0] || "Olá";
  const planoLabel = plano
    ? (PLANO_LABEL[plano as Plano] ?? plano)
    : "Clube +HCE";
  const valor =
    typeof valorCentavos === "number"
      ? (valorCentavos / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : null;
  const url = `${appUrl()}/conta`;

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
    <h1 style="color:#0b2a4a;font-size:20px;margin:0 0 12px">Bem-vindo ao Clube +HCE, ${primeiro}!</h1>
    <p style="line-height:1.6;margin:0 0 12px">
      Seu pagamento foi confirmado e seu acesso ao plano
      <strong>${planoLabel}</strong> já está liberado${valor ? ` (${valor}/mês)` : ""}.
    </p>
    <p style="line-height:1.6;margin:0 0 20px">
      Aproveite as receitas, fichas técnicas, e-books e conteúdos exclusivos.
    </p>
    <p style="margin:0 0 24px">
      <a href="${url}" style="background:#f4b400;color:#0b2a4a;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:9999px;display:inline-block">
        Acessar minha conta
      </a>
    </p>
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0">
      A cobrança é mensal e você pode cancelar quando quiser em Minha conta &rsaquo; Pagamento.
      Em caso de dúvida, responda este e-mail.
    </p>
  </div>`;

  await sendEmail({
    to: u.email,
    subject: `Bem-vindo ao Clube +HCE — plano ${planoLabel}`,
    html,
  });
}

// Processa eventos INVOICE_* (NFS-e): grava/atualiza a NotaFiscal ligada ao
// Pagamento e, quando emitida, envia a nota (PDF) por e-mail. Só ocorre quando
// a emissão automática está ligada (flag) — sem isso, o Asaas não gera notas.
async function processarNota(
  inv: AsaasWebhookInvoice | undefined,
  evento: string,
): Promise<void> {
  if (!inv?.id) return;
  const status = EVENTOS_NOTA[evento] ?? "pendente";

  // Localiza a cobrança correspondente para ligar a nota (1:1 com Pagamento).
  const pagamento = inv.payment
    ? await prisma.pagamento.findUnique({
        where: { asaasPaymentId: inv.payment },
      })
    : null;
  if (!pagamento) {
    console.warn("[webhook] nota sem pagamento conhecido", inv.id, evento);
    return;
  }

  await prisma.notaFiscal.upsert({
    where: { pagamentoId: pagamento.id },
    create: {
      pagamentoId: pagamento.id,
      asaasNotaId: inv.id,
      numero: inv.number ?? null,
      status,
      pdfUrl: inv.pdfUrl ?? null,
      xmlUrl: inv.xmlUrl ?? null,
      emitidaEm: status === "emitida" ? new Date() : null,
    },
    update: {
      asaasNotaId: inv.id,
      ...(inv.number ? { numero: inv.number } : {}),
      status,
      ...(inv.pdfUrl ? { pdfUrl: inv.pdfUrl } : {}),
      ...(inv.xmlUrl ? { xmlUrl: inv.xmlUrl } : {}),
      ...(status === "emitida" ? { emitidaEm: new Date() } : {}),
    },
  });

  if (status === "emitida" && inv.pdfUrl) {
    await enviarNota(pagamento.userId, inv.pdfUrl, inv.number ?? null).catch(
      () => null,
    );
  }
}

// E-mail com a nota fiscal (PDF) ao cliente.
async function enviarNota(
  userId: string,
  pdfUrl: string,
  numero: string | null,
): Promise<void> {
  if (!emailConfigured()) return;
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!u?.email) return;
  const primeiro = (u.name ?? "").trim().split(" ")[0] || "Olá";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
    <h1 style="color:#0b2a4a;font-size:20px;margin:0 0 12px">Sua nota fiscal, ${primeiro}</h1>
    <p style="line-height:1.6;margin:0 0 12px">
      A nota fiscal ${numero ? `nº <strong>${numero}</strong> ` : ""}referente à sua
      assinatura do Clube +HCE foi emitida.
    </p>
    <p style="margin:0 0 24px">
      <a href="${pdfUrl}" style="background:#f4b400;color:#0b2a4a;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:9999px;display:inline-block">
        Baixar a nota (PDF)
      </a>
    </p>
    <p style="color:#6b7280;font-size:12px;line-height:1.6;margin:0">
      Você também encontra suas notas em Minha conta &rsaquo; Pagamento.
    </p>
  </div>`;

  await sendEmail({
    to: u.email,
    subject: `Nota fiscal — Clube +HCE${numero ? ` (nº ${numero})` : ""}`,
    html,
  });
}
