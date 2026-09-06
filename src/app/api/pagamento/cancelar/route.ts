import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import { rateLimit } from "@/lib/rate-limit";
import { asaasCancelarAssinatura, AsaasError } from "@/lib/asaas";

// Cancelamento da assinatura pelo próprio usuário (BAC_143, Fase 5).
// Cessa as cobranças futuras no Asaas e encerra o acesso pago.
//
// Decisão de produto (MVP, sem agendador): o cancelamento é imediato — a
// assinatura vira "cancelada" e o plano volta a "free" na hora. Manter acesso
// até o fim do ciclo pago exigiria um job agendado (fica para depois).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const rl = await rateLimit(`cancelar:${user.id}`, 6, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const assinatura = await prisma.assinatura.findFirst({
    where: { userId: user.id, status: { in: ["trial", "ativa", "inadimplente"] } },
    orderBy: { createdAt: "desc" },
  });
  if (!assinatura) {
    return NextResponse.json(
      { error: "Você não tem uma assinatura ativa para cancelar." },
      { status: 400 },
    );
  }

  try {
    if (assinatura.asaasSubscriptionId) {
      await asaasCancelarAssinatura(assinatura.asaasSubscriptionId);
    }
  } catch (e) {
    if (e instanceof AsaasError) {
      console.error("[cancelar] Asaas", e.status, JSON.stringify(e.body));
    } else {
      console.error("[cancelar] erro", e);
    }
    return NextResponse.json(
      { error: "Não foi possível cancelar agora. Tente novamente." },
      { status: 502 },
    );
  }

  await prisma.assinatura.update({
    where: { id: assinatura.id },
    data: { status: "cancelada", canceladaEm: new Date() },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { statusAssinatura: "cancelada", plano: "free" },
  });

  return NextResponse.json({ ok: true });
}
