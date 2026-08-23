import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import { MIDIA_TIPOS } from "@/lib/na-midia";

// CRUD dos cards da seção pública "Na Mídia" (BAC_130). Protegido pelo login
// do /adm. A página pública passa a ler estes registros (só publicados).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// URL de link (principal e extras): apenas http/https.
const urlHttp = z
  .string()
  .trim()
  .max(600)
  .refine((u) => /^https?:\/\//i.test(u), "Link inválido (use http/https)");

// Caminho de imagem: sempre da mesma origem (upload local /api/img/... ou
// asset em /brand/...). Bloqueia hotlink externo e esquemas perigosos.
const caminhoLocal = z
  .string()
  .trim()
  .max(600)
  .refine((u) => u === "" || u.startsWith("/"), "Imagem deve ser local")
  .transform((u) => u || "")
  .nullable()
  .optional();

const schema = z.object({
  id: z.string().optional(),
  tipo: z.enum(MIDIA_TIPOS),
  veiculo: z.string().trim().min(1, "Veículo obrigatório").max(120),
  autor: z.string().trim().min(1, "Autor obrigatório").max(120),
  titulo: z.string().trim().min(1, "Título obrigatório").max(180),
  descricao: z.string().trim().max(600).optional().default(""),
  url: urlHttp,
  linksExtras: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(40),
        url: urlHttp,
      }),
    )
    .max(6, "No máximo 6 links extras")
    .optional()
    .default([]),
  thumbUrl: caminhoLocal,
  thumbPos: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9%.\s-]*$/, "Posição inválida")
    .optional()
    .nullable(),
  avatarUrl: caminhoLocal,
  logoVeiculo: caminhoLocal,
  logoAlt: z.string().trim().max(60).optional().nullable(),
  logoClasse: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9%.\[\]\s_-]*$/, "Classe inválida")
    .optional()
    .nullable(),
  publicado: z.boolean().optional().default(true),
});

// Descrição é texto puro (a página renderiza como texto, sem HTML). Removemos
// eventuais tags para não vazar marcação e mantê-la como legenda curta.
function textoPuro(s: string): string {
  return s
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
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
    tipo: data.tipo,
    veiculo: data.veiculo,
    autor: data.autor,
    titulo: data.titulo,
    descricao: textoPuro(data.descricao || ""),
    url: data.url,
    linksExtras: (data.linksExtras || []).map((l) => ({
      label: l.label,
      url: l.url,
    })),
    thumbUrl: data.thumbUrl || null,
    thumbPos: data.thumbPos?.trim() || null,
    avatarUrl: data.avatarUrl || null,
    logoVeiculo: data.logoVeiculo || null,
    logoAlt: data.logoAlt?.trim() || null,
    logoClasse: data.logoClasse?.trim() || null,
    publicado: data.publicado ?? true,
  };

  if (data.id) {
    const atual = await prisma.midiaItem.findUnique({ where: { id: data.id } });
    if (!atual) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 },
      );
    }
    const item = await prisma.midiaItem.update({
      where: { id: data.id },
      data: base,
    });
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "namidia.editar",
      detalhe: `${item.titulo} (${item.tipo})`,
      ...ctx,
    });
    return NextResponse.json({ id: item.id });
  }

  // Novo item entra no fim da ordem.
  const ultimo = await prisma.midiaItem.aggregate({
    _max: { ordem: true },
  });
  const ordem = (ultimo._max.ordem ?? 0) + 1;

  const item = await prisma.midiaItem.create({
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
    acao: "namidia.criar",
    detalhe: `${item.titulo} (${item.tipo})`,
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

  const item = await prisma.midiaItem
    .update({
      where: { id: body.id },
      data: { publicado: body.publicado },
    })
    .catch(() => null);
  if (!item) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: body.publicado ? "namidia.publicar" : "namidia.despublicar",
    detalhe: `${item.titulo} (${item.tipo})`,
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

  const item = await prisma.midiaItem.delete({ where: { id } }).catch(() => null);
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "namidia.excluir",
    detalhe: item ? `${item.titulo} (${item.tipo})` : id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
