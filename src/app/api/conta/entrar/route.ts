import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, normalizeEmail, verifyPassword } from "@/lib/auth-user";

// Login da conta do site (Frente A).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(180),
  senha: z.string().min(1, "Informe a senha").max(200),
});

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "desconhecido";
  const rl = rateLimit(`entrar:${ip}`, 10, 15 * 60 * 1000); // 10 / 15 min por IP
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
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const email = normalizeEmail(data.email);
  const user = await prisma.user.findUnique({ where: { email } });

  // Mensagem generica (nao revela se o e-mail existe).
  const invalido = () =>
    NextResponse.json(
      { error: "E-mail ou senha incorretos." },
      { status: 401 },
    );

  if (!user || !user.passwordHash) return invalido();
  if (!verifyPassword(data.senha, user.passwordHash)) return invalido();

  // Senha correta. Abrimos a sessao, mas se o e-mail ainda nao foi confirmado a
  // pessoa fica "presa" na verificacao: todas as areas protegidas redirecionam
  // para /verificar-email ate ela digitar o codigo enviado ao e-mail real.
  await createSession(user.id);
  if (!user.emailVerified) {
    return NextResponse.json({ ok: true, needsVerification: true });
  }
  return NextResponse.json({ ok: true });
}
