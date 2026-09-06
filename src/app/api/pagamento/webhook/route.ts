import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { webhookTokenValido } from "@/lib/asaas";

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

type AsaasWebhookBody = {
  event?: string;
  payment?: AsaasWebhookPayment;
  subscription?: { id?: string };
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
