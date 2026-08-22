import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser, sha256 } from "@/lib/auth-user";

// Verificacao de e-mail (opcional). Passo 2: confere o codigo de 6 digitos e,
// se valido e dentro do prazo, marca o e-mail como verificado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IDENT = (userId: string) => `emailverify:${userId}`;

const schema = z.object({
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "O código tem 6 dígitos."),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  // Anti-brute-force: no maximo 6 tentativas a cada 15 min por usuario.
  // Com o codigo valendo so 100s, torna a adivinhacao inviavel.
  const rl = await rateLimit(`verif-confirmar:${user.id}`, 6, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e peça um novo código." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch (e) {
    const msg =
      e instanceof z.ZodError
        ? (e.issues[0]?.message ?? "Código inválido")
        : "Código inválido";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const ja = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true },
  });
  if (ja?.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const identifier = IDENT(user.id);
  const registro = await prisma.verificationToken.findFirst({
    where: { identifier, token: sha256(data.codigo) },
  });

  if (!registro || registro.expires < new Date()) {
    return NextResponse.json(
      { error: "Código inválido ou expirado. Peça um novo código." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { identifier } });

  return NextResponse.json({ ok: true });
}
