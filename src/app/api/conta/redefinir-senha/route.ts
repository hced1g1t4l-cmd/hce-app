import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import { rateLimit } from "@/lib/rate-limit";
import {
  destroyAllSessions,
  hashPassword,
  sha256,
} from "@/lib/auth-user";

// Efetiva a nova senha a partir do token do link enviado por e-mail (Frente A).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(10).max(200),
  senha: z.string().min(8, "A senha precisa de ao menos 8 caracteres").max(200),
});

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "desconhecido";
  const rl = rateLimit(`redefinir:${ip}`, 15, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? (e.issues[0]?.message ?? "Dados inválidos")
        : "Dados inválidos";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const vt = await prisma.verificationToken.findFirst({
    where: { token: sha256(data.token) },
  });
  if (!vt || vt.expires < new Date()) {
    return NextResponse.json(
      { error: "Link inválido ou expirado. Peça um novo." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: vt.identifier },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Link inválido ou expirado. Peça um novo." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(data.senha) },
  });
  // Consome o token e encerra sessoes antigas (forca novo login).
  await prisma.verificationToken.deleteMany({
    where: { identifier: vt.identifier },
  });
  await destroyAllSessions(user.id);

  return NextResponse.json({ ok: true });
}
