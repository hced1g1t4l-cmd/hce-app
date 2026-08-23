import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";

// CRUD dos depoimentos exibidos na home (BAC_137). Protegido pelo login do
// /adm. A home passa a ler estes registros (só publicados, ordenados).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATOS = ["texto", "imagem", "video"] as const;

// Caminho de imagem: sempre da mesma origem (/api/img/... ou /brand/...).
const caminhoLocal = z
  .string()
  .trim()
  .max(600)
  .refine((u) => u === "" || u.startsWith("/"), "Imagem deve ser local")
  .nullable()
  .optional();

const schema = z.object({
  id: z.string().optional(),
  nome: z.string().trim().min(1, "Nome obrigatório").max(160),
  cargo: z.string().trim().max(200).optional().default(""),
  texto: z.string().trim().min(1, "Depoimento obrigatório").max(4000),
  fotoUrl: caminhoLocal,
  formato: z.enum(FORMATOS).optional().default("texto"),
  publicado: z.boolean().optional().default(true),
});

// Depoimento é texto puro (a home renderiza com quebras de linha). Removemos
// eventuais tags, preservando as quebras de parágrafo.
function textoPuro(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de continuar." },
      { status: 403 },
    );
  }
  const ctx = {
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  };

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

  const base = {
    nome: data.nome,
    cargo: data.cargo?.trim() || "",
    texto: textoPuro(data.texto),
    fotoUrl: data.fotoUrl || null,
    formato: data.formato ?? "texto",
    publicado: data.publicado ?? true,
  };

  if (data.id) {
    const atual = await prisma.depoimento.findUnique({
      where: { id: data.id },
    });
    if (!atual) {
      return NextResponse.json(
        { error: "Depoimento não encontrado" },
        { status: 404 },
      );
    }
    const item = await prisma.depoimento.update({
      where: { id: data.id },
      data: base,
    });
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "depoimento.editar",
      detalhe: `${item.nome}`,
      ...ctx,
    });
    return NextResponse.json({ id: item.id });
  }

  const ultimo = await prisma.depoimento.aggregate({ _max: { ordem: true } });
  const ordem = (ultimo._max.ordem ?? 0) + 1;

  const item = await prisma.depoimento.create({
    data: {
      ...base,
      ordem,
      criadoPorLogin: admin.login,
      criadoPorNome: admin.nome,
    },
  });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "depoimento.criar",
    detalhe: `${item.nome}`,
    ...ctx,
  });
  return NextResponse.json({ id: item.id });
}

// Alterna publicado/despublicado sem reenviar o formulário inteiro.
export async function PATCH(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de continuar." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    id?: string;
    publicado?: boolean;
  };
  if (!body.id || typeof body.publicado !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const item = await prisma.depoimento
    .update({ where: { id: body.id }, data: { publicado: body.publicado } })
    .catch(() => null);
  if (!item) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: body.publicado ? "depoimento.publicar" : "depoimento.despublicar",
    detalhe: `${item.nome}`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true, publicado: item.publicado });
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de continuar." },
      { status: 403 },
    );
  }

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }

  const item = await prisma.depoimento
    .delete({ where: { id } })
    .catch(() => null);
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "depoimento.excluir",
    detalhe: item ? `${item.nome}` : id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
