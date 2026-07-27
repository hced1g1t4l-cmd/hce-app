import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { r2Configured, signedGetUrl } from "@/lib/storage";

// Abrir/baixar um arquivo pela biblioteca do /adm (sempre gera URL assinada curta).
// ?download=1 forca "salvar como".
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { error: "Armazenamento não configurado." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const download = new URL(req.url).searchParams.get("download") === "1";
  const url = await signedGetUrl(asset.key, {
    expiresIn: 300,
    downloadName: download ? asset.filename : undefined,
  });
  return NextResponse.redirect(url, 302);
}
