import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  hashResetToken,
  hashPassword,
  senhaForte,
  destroyAllAdminSessions,
  logAdm,
} from "@/lib/adm";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "sem-ip";
  const limit = rateLimit(`adm-redefinir:${ip}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    token?: string;
    nova?: string;
    confirmar?: string;
  };
  const token = String(body.token || "");
  const nova = String(body.nova || "");
  const confirmar = String(body.confirmar || "");

  if (!token) {
    return NextResponse.json({ error: "Link inválido." }, { status: 400 });
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

  const registro = await prisma.adminResetToken.findUnique({
    where: { tokenHash: hashResetToken(token) },
  });
  if (!registro || registro.usado || registro.expires < new Date()) {
    return NextResponse.json(
      { error: "Link expirado ou já utilizado. Solicite um novo." },
      { status: 400 },
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: registro.adminId },
  });
  if (!admin) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { senhaHash: hashPassword(nova), precisaTrocarSenha: false },
  });
  await prisma.adminResetToken.update({
    where: { tokenHash: registro.tokenHash },
    data: { usado: true },
  });
  // Invalida qualquer sessao antiga por seguranca.
  await destroyAllAdminSessions(admin.id);
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "senha.reset.concluir",
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
