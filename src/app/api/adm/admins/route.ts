import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAdmin, hashPassword, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe o nome").max(120),
  login: z
    .string()
    .trim()
    .min(3, "Login muito curto")
    .max(60)
    .regex(
      /^[a-z0-9._-]+$/,
      "Use apenas letras minúsculas, números, ponto, hífen ou underscore.",
    ),
  emailPrincipal: z
    .string()
    .trim()
    .email("E-mail inválido")
    .max(180)
    .optional()
    .or(z.literal("")),
  senhaProvisoria: z.string().min(6).max(72).optional().or(z.literal("")),
});

function gerarSenhaProvisoria(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `Hce@${n}`;
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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

  const login = data.login.toLowerCase();
  const existe = await prisma.admin.findUnique({ where: { login } });
  if (existe) {
    return NextResponse.json(
      { error: "Já existe um admin com esse login." },
      { status: 409 },
    );
  }

  const senha = data.senhaProvisoria || gerarSenhaProvisoria();

  const novo = await prisma.admin.create({
    data: {
      login,
      nome: data.nome,
      senhaHash: hashPassword(senha),
      emailPrincipal: data.emailPrincipal ? data.emailPrincipal.toLowerCase() : null,
      precisaTrocarSenha: true,
      ativo: true,
      criadoPor: admin.login,
    },
  });

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "admin.criar",
    detalhe: `criou ${login}`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({
    id: novo.id,
    login: novo.login,
    senhaProvisoria: senha,
  });
}
