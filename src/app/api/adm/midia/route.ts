import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { deleteObject, putObject, r2Configured } from "@/lib/storage";
import { PLANOS } from "@/lib/planos";

// Frente B: gerencia a biblioteca de midia (fichas, e-books, planilhas, imagens).
// Protegido pelo login do /adm. Os bytes vao para o Cloudflare R2; o metadado, no Postgres.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (PDFs/e-books)

// mime -> tipo logico exibido na biblioteca.
const TIPOS: { test: (m: string, name: string) => boolean; tipo: string }[] = [
  { test: (m) => m.startsWith("image/"), tipo: "imagem" },
  { test: (m) => m === "application/pdf", tipo: "pdf" },
  {
    test: (m, n) => m === "application/epub+zip" || /\.epub$/i.test(n),
    tipo: "ebook",
  },
  {
    test: (m, n) =>
      m.includes("spreadsheet") ||
      m === "text/csv" ||
      /\.(xlsx|xls|csv|ods)$/i.test(n),
    tipo: "planilha",
  },
];

function tipoDe(mime: string, name: string): string {
  for (const t of TIPOS) if (t.test(mime, name)) return t.tipo;
  return "outro";
}

function sanitize(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120) || "arquivo"
  );
}

export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      {
        error:
          "Armazenamento (Cloudflare R2) ainda não configurado. Defina as variáveis R2_* na Vercel.",
      },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máximo 50 MB)" },
      { status: 413 },
    );
  }

  const titulo = (form.get("titulo") as string | null)?.trim() || null;
  const visibilidade =
    (form.get("visibilidade") as string | null) === "publico"
      ? "publico"
      : "privado";
  let planoMinimo = (form.get("planoMinimo") as string | null) || "free";
  if (!PLANOS.includes(planoMinimo as (typeof PLANOS)[number])) {
    planoMinimo = "free";
  }

  const mime = file.type || "application/octet-stream";
  const tipo = tipoDe(mime, file.name);
  const safe = sanitize(file.name);
  const key = `${tipo}/${crypto.randomUUID()}-${safe}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    await putObject(key, bytes, mime);
  } catch (e) {
    const detalhe =
      e instanceof Error ? e.message : "erro desconhecido no armazenamento";
    console.error("[midia] falha no upload R2:", detalhe);
    return NextResponse.json(
      {
        error: `Falha ao enviar para o armazenamento: ${detalhe}`,
      },
      { status: 502 },
    );
  }

  const asset = await prisma.mediaAsset.create({
    data: {
      key,
      filename: file.name,
      titulo,
      mime,
      tamanho: file.size,
      tipo,
      visibilidade,
      planoMinimo,
    },
  });

  return NextResponse.json({ id: asset.id, url: `/api/midia/${asset.id}` });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id ausente" }, { status: 400 });
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id: body.id } });
  if (!asset) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await deleteObject(asset.key).catch(() => null);
  await prisma.mediaAsset.delete({ where: { id: asset.id } });

  return NextResponse.json({ ok: true });
}
