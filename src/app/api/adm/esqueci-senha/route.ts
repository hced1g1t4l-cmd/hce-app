import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashResetToken, logAdm } from "@/lib/adm";
import { randomToken } from "@/lib/auth-user";
import { sendEmail, appUrl, emailConfigured } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_MS = 60 * 60 * 1000; // 1 hora
const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "sem-ip";
  const limit = rateLimit(`adm-esqueci:${ip}`, LIMIT, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos." },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    identificador?: string;
  };
  const ident = String(body.identificador || "").trim().toLowerCase();

  // Resposta sempre generica (nao revela se o login/e-mail existe).
  const generico = NextResponse.json({
    ok: true,
    mensagem:
      "Se houver uma conta com esses dados e um e-mail de resgate cadastrado, enviaremos o link.",
  });

  if (!ident) return generico;

  const admin = await prisma.admin.findFirst({
    where: {
      ativo: true,
      OR: [
        { login: ident },
        { emailPrincipal: ident },
        { emailSecundario: ident },
      ],
    },
  });

  if (!admin) return generico;

  const destinos = [admin.emailPrincipal, admin.emailSecundario].filter(
    (e): e is string => Boolean(e),
  );
  if (destinos.length === 0) {
    // Sem e-mail cadastrado: nao ha para onde enviar.
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "senha.reset.solicitar",
      detalhe: "sem e-mail de resgate cadastrado",
      ip,
      userAgent: req.headers.get("user-agent"),
    });
    return generico;
  }

  if (!emailConfigured()) {
    return NextResponse.json(
      { error: "Serviço de e-mail indisponível no momento." },
      { status: 503 },
    );
  }

  const tokenCru = randomToken();
  await prisma.adminResetToken.create({
    data: {
      adminId: admin.id,
      tokenHash: hashResetToken(tokenCru),
      expires: new Date(Date.now() + TTL_MS),
    },
  });

  const link = `${appUrl()}/adm/redefinir-senha?token=${tokenCru}`;
  const html = `
    <div style="font-family:Arial,sans-serif;color:#131720;max-width:520px">
      <h2 style="color:#003288">Redefinição de senha — Painel HCE</h2>
      <p>Olá, ${admin.nome}. Recebemos um pedido para redefinir a senha do seu acesso ao painel.</p>
      <p>Clique no botão abaixo para criar uma nova senha. O link vale por 1 hora.</p>
      <p style="margin:24px 0">
        <a href="${link}" style="background:#003288;color:#e8a200;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Redefinir minha senha</a>
      </p>
      <p style="font-size:13px;color:#5a6473">Se não foi você, ignore este e-mail — sua senha continua a mesma.</p>
      <p style="font-size:12px;color:#5a6473">Este endereço não recebe respostas (naoresponda@hcegastronomia.com).</p>
    </div>`;

  for (const to of destinos) {
    await sendEmail({
      to,
      subject: "Redefinição de senha — Painel HCE",
      html,
    });
  }

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "senha.reset.solicitar",
    detalhe: `link enviado para ${destinos.length} e-mail(s)`,
    ip,
    userAgent: req.headers.get("user-agent"),
  });

  return generico;
}
