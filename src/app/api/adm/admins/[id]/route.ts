import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getAdmin,
  hashPassword,
  destroyAllAdminSessions,
  logAdm,
} from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";
import { gerarSenhaProvisoria } from "@/lib/senha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Acoes de gestao de um admin: ativar, desativar, resetar senha.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de gerenciar admins." },
      { status: 403 },
    );
  }
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { acao?: string };
  const acao = body.acao;

  const alvo = await prisma.admin.findUnique({ where: { id } });
  if (!alvo) {
    return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 });
  }

  const ctx = {
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  };

  if (acao === "desativar") {
    if (alvo.id === admin.id) {
      return NextResponse.json(
        { error: "Você não pode desativar a sua própria conta." },
        { status: 400 },
      );
    }
    const ativos = await prisma.admin.count({ where: { ativo: true } });
    if (ativos <= 1) {
      return NextResponse.json(
        { error: "Não é possível desativar o último admin ativo." },
        { status: 400 },
      );
    }
    await prisma.admin.update({ where: { id }, data: { ativo: false } });
    await destroyAllAdminSessions(id);
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "admin.desativar",
      detalhe: `desativou ${alvo.login}`,
      ...ctx,
    });
    return NextResponse.json({ ok: true });
  }

  if (acao === "ativar") {
    await prisma.admin.update({ where: { id }, data: { ativo: true } });
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "admin.ativar",
      detalhe: `ativou ${alvo.login}`,
      ...ctx,
    });
    return NextResponse.json({ ok: true });
  }

  if (acao === "resetar") {
    const senha = gerarSenhaProvisoria();
    await prisma.admin.update({
      where: { id },
      data: {
        senhaHash: hashPassword(senha),
        precisaTrocarSenha: true,
        tentativasFalhas: 0,
        bloqueadoAte: null,
      },
    });
    await destroyAllAdminSessions(id);
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "admin.resetar-senha",
      detalhe: `resetou a senha de ${alvo.login}`,
      ...ctx,
    });
    return NextResponse.json({ ok: true, senhaProvisoria: senha });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
