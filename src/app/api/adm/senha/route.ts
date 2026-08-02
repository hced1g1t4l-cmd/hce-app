import { NextResponse } from "next/server";
import {
  getAdmin,
  hashPassword,
  verifyPassword,
  senhaForte,
  destroyAllAdminSessions,
  createAdminSession,
  logAdm,
} from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Troca de senha do proprio admin logado.
// - 1o acesso (precisaTrocarSenha): nao exige senha atual.
// - Depois: exige a senha atual para confirmar a identidade.
export async function POST(req: Request) {
  const sessao = await getAdmin();
  if (!sessao) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    atual?: string;
    nova?: string;
    confirmar?: string;
  };
  const nova = String(body.nova || "");
  const confirmar = String(body.confirmar || "");

  const admin = await prisma.admin.findUnique({ where: { id: sessao.id } });
  if (!admin) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  if (!admin.precisaTrocarSenha) {
    const atual = String(body.atual || "");
    if (!atual || !verifyPassword(atual, admin.senhaHash)) {
      return NextResponse.json(
        { error: "Senha atual incorreta." },
        { status: 400 },
      );
    }
  }

  if (!senhaForte(nova)) {
    return NextResponse.json(
      {
        error:
          "A senha precisa ter ao menos 6 caracteres, com maiúscula, minúscula, número e caractere especial.",
      },
      { status: 400 },
    );
  }
  if (nova !== confirmar) {
    return NextResponse.json(
      { error: "A confirmação não confere." },
      { status: 400 },
    );
  }
  if (verifyPassword(nova, admin.senhaHash)) {
    return NextResponse.json(
      { error: "A nova senha deve ser diferente da atual." },
      { status: 400 },
    );
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { senhaHash: hashPassword(nova), precisaTrocarSenha: false },
  });

  // Encerra todas as sessoes e recria a atual (mantem o admin logado).
  await destroyAllAdminSessions(admin.id);
  await createAdminSession(admin.id);

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "senha.trocar",
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
