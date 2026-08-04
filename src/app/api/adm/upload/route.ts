import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";

// Upload de imagem para o Feed HCE (F1-5). Protegido pelo login do /adm.
// A imagem e guardada no proprio Postgres (tabela Imagem) e servida por /api/img/{id}.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

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
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado (use JPG, PNG, WEBP, GIF ou AVIF)" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande (máximo 6 MB)" },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const img = await prisma.imagem.create({
    data: { mime: file.type, dados: bytes },
  });

  return NextResponse.json({ url: `/api/img/${img.id}` });
}
