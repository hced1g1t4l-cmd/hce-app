import { NextResponse } from "next/server";
import { getAdmin, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";
import { runSentinela } from "@/lib/sentinela-runner";

// Disparo MANUAL do Sentinela pelo painel (/adm/sentinela, botao "Rodar agora").
// Protegido pelo login de admin.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const resultado = await runSentinela("manual");

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "sentinela.run",
    detalhe: `manual · ${resultado.ok ? "ok" : "atenção"} · ${resultado.incidentesAbertos.length} aberto(s), ${resultado.incidentesResolvidos.length} resolvido(s)`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json(resultado);
}
