import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";

// Modera um comentario: aprovar (aparece no site) ou reprovar (fica oculto).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  let body: { acao?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const acao = body.acao;
  if (acao !== "aprovar" && acao !== "reprovar") {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const coment = await prisma.comentario.findUnique({
    where: { id },
    select: { id: true, artigo: { select: { titulo: true } } },
  });
  if (!coment) {
    return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
  }

  const status = acao === "aprovar" ? "aprovado" : "reprovado";
  await prisma.comentario.update({
    where: { id },
    data: { status, moderadoEm: new Date(), moderadoPor: admin.login },
  });

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: `comentario.${acao}`,
    detalhe: coment.artigo?.titulo ?? id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true, status });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const coment = await prisma.comentario.findUnique({
    where: { id },
    select: { id: true, artigo: { select: { titulo: true } } },
  });
  if (!coment) {
    return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
  }
  await prisma.comentario.delete({ where: { id } });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "comentario.excluir",
    detalhe: coment.artigo?.titulo ?? id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
