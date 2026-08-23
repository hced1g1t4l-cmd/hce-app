import { NextResponse } from "next/server";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";

// Reordena os depoimentos da home (BAC_137). Recebe a lista de ids na ordem
// desejada e grava `ordem` = índice. Protegido pelo login do /adm.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de continuar." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { ids?: unknown };
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((x): x is string => typeof x === "string")
    : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "Lista vazia" }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id, i) =>
      prisma.depoimento.update({ where: { id }, data: { ordem: i + 1 } }),
    ),
  );

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "depoimento.reordenar",
    detalhe: `${ids.length} itens`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
