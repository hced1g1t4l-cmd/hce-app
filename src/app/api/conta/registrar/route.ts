import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getClientIp, verifyCaptcha } from "@/lib/anti-bot";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, hashPassword, normalizeEmail } from "@/lib/auth-user";
import { normalizarTelefone } from "@/lib/telefone";

// Cadastro de conta free (Frente A). Cria o usuario, abre sessao e serve de lead.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail inválido").max(180),
  senha: z
    .string()
    .max(200)
    .refine(
      (s) =>
        s.length >= 6 &&
        /[A-Z]/.test(s) &&
        /[a-z]/.test(s) &&
        /[0-9]/.test(s) &&
        /[^A-Za-z0-9]/.test(s),
      "A senha precisa ter ao menos 6 caracteres, com maiúscula, minúscula, número e caractere especial.",
    ),
  telefone: z.string().trim().max(40).optional().nullable(),
  aceitaComunicacoes: z.boolean().optional(),
  website: z.string().max(200).optional(), // honeypot: humano deixa vazio
  captchaToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "desconhecido";
  const rl = rateLimit(`registrar:${ip}`, 8, 60 * 60 * 1000); // 8/h por IP
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

  // Honeypot preenchido -> provavel bot. Responde ok sem criar nada.
  if (data.website) return NextResponse.json({ ok: true });

  if (!(await verifyCaptcha(data.captchaToken))) {
    return NextResponse.json(
      { error: "Confirme que você não é um robô." },
      { status: 400 },
    );
  }

  const email = normalizeEmail(data.email);
  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail. Faça login." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name: data.nome,
      email,
      telefone: normalizarTelefone(data.telefone),
      aceitaComunicacoes: Boolean(data.aceitaComunicacoes),
      passwordHash: hashPassword(data.senha),
      role: "MEMBER",
      plano: "free",
    },
  });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
