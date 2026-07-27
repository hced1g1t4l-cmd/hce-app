import { NextResponse } from "next/server";
import { z } from "zod";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/feed";

// CRUD dos artigos do Feed HCE (F1-5). Protegido pelo login do /adm.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().optional(),
  titulo: z.string().trim().min(1, "Título obrigatório").max(180),
  slug: z.string().trim().max(180).optional().nullable(),
  resumo: z.string().trim().max(600).optional().nullable(),
  capaUrl: z.string().trim().max(600).optional().nullable(),
  autor: z.string().trim().min(1, "Autor obrigatório").max(140),
  conteudoHtml: z.string().max(400000),
  publicado: z.boolean().default(false),
});

async function slugUnico(base: string, ignoreId?: string): Promise<string> {
  const raiz = slugify(base) || "artigo";
  let slug = raiz;
  let n = 2;
  // Garante unicidade sem colidir com outro artigo.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existe = await prisma.artigo.findUnique({ where: { slug } });
    if (!existe || existe.id === ignoreId) return slug;
    slug = `${raiz}-${n++}`;
  }
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
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

  const slug = await slugUnico(data.slug || data.titulo, data.id);

  const base = {
    titulo: data.titulo,
    slug,
    resumo: data.resumo || null,
    capaUrl: data.capaUrl || null,
    autor: data.autor,
    conteudoHtml: data.conteudoHtml,
    publicado: data.publicado,
  };

  if (data.id) {
    const atual = await prisma.artigo.findUnique({ where: { id: data.id } });
    if (!atual) {
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 },
      );
    }
    // Define a data de publicacao na primeira vez que for publicado.
    const publicadoEm =
      data.publicado && !atual.publicadoEm ? new Date() : atual.publicadoEm;
    const artigo = await prisma.artigo.update({
      where: { id: data.id },
      data: { ...base, publicadoEm },
    });
    return NextResponse.json({ id: artigo.id, slug: artigo.slug });
  }

  const artigo = await prisma.artigo.create({
    data: { ...base, publicadoEm: data.publicado ? new Date() : null },
  });
  return NextResponse.json({ id: artigo.id, slug: artigo.slug });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) {
    return NextResponse.json({ error: "ID ausente" }, { status: 400 });
  }
  await prisma.artigo.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
