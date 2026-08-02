import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";

// Foto de perfil do admin. A imagem chega ja REDUZIDA no cliente (canvas);
// aqui validamos e guardamos na tabela Imagem (servida por /api/img/{id}).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
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
      { error: "Formato não suportado (use JPG, PNG ou WEBP)." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Imagem muito grande. Tente uma foto menor." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const img = await prisma.imagem.create({
    data: { mime: file.type, dados: bytes },
  });
  const url = `/api/img/${img.id}`;

  await prisma.admin.update({ where: { id: admin.id }, data: { fotoUrl: url } });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "perfil.foto",
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ url });
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.admin.update({
    where: { id: admin.id },
    data: { fotoUrl: null },
  });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "perfil.foto.remover",
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
