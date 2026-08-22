import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, verifyCaptcha } from "@/lib/anti-bot";
import { rateLimit } from "@/lib/rate-limit";
import { normalizeEmail, randomToken, sha256 } from "@/lib/auth-user";
import { appUrl, sendEmail } from "@/lib/email";

// Solicitacao de redefinicao de senha (Frente A). Com reCAPTCHA para impedir
// que robos disparem em massa e "travem" o rate-limit de usuarios legitimos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(180),
  captchaToken: z.string().optional(),
  website: z.string().max(200).optional(), // honeypot
});

function emailHtml(link: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#131720">
    <h2 style="color:#003288">Redefinir sua senha</h2>
    <p>Recebemos um pedido para redefinir a senha da sua conta HCE.</p>
    <p>Clique no botão abaixo para criar uma nova senha. O link vale por 1 hora.</p>
    <p style="margin:28px 0">
      <a href="${link}" style="background:#003288;color:#e8a200;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;display:inline-block">Criar nova senha</a>
    </p>
    <p style="font-size:13px;color:#5a6473">Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>
    <p style="font-size:13px;color:#5a6473">Se o botão não funcionar, copie e cole no navegador:<br>${link}</p>
  </div>`;
}

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "desconhecido";
  const rl = await rateLimit(`esqueci:${ip}`, 5, 60 * 60 * 1000); // 5/h por IP
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  // Honeypot preenchido -> bot. Responde ok sem fazer nada.
  if (data.website) return NextResponse.json({ ok: true });

  if (!(await verifyCaptcha(data.captchaToken))) {
    return NextResponse.json(
      { error: "Confirme que você não é um robô." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(data.email);
  const user = await prisma.user.findUnique({ where: { email } });

  // Só gera token/e-mail se a conta existir E tiver senha (não social-only).
  if (user && user.passwordHash) {
    const raw = randomToken();
    const expires = new Date(Date.now() + TOKEN_TTL_MS);
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token: sha256(raw), expires },
    });
    const link = `${appUrl()}/redefinir-senha?token=${raw}`;
    await sendEmail({
      to: email,
      subject: "Redefinir sua senha · HCE",
      html: emailHtml(link),
    });
  }

  // Resposta sempre generica (nao revela se o e-mail existe).
  return NextResponse.json({ ok: true });
}
