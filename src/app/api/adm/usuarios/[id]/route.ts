import { NextResponse } from "next/server";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";

// Exclusao de uma conta de usuario pelo painel /adm.
// Sessions e Accounts saem por cascade (onDelete: Cascade no schema).
// Tokens de verificacao/redefinicao ficam por identifier (sem FK), entao
// limpamos manualmente os relacionados a este usuario.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const alvo = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!alvo) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  // Limpa tokens (verificacao de e-mail e "esqueci minha senha").
  const identifiers = [`emailverify:${id}`];
  if (alvo.email) identifiers.push(alvo.email);
  await prisma.verificationToken.deleteMany({
    where: { identifier: { in: identifiers } },
  });

  await prisma.user.delete({ where: { id } });

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "usuario.excluir",
    detalhe: alvo.email ?? id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
