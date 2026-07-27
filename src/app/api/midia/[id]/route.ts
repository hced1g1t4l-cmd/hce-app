import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import { planoAtende } from "@/lib/planos";
import { publicUrl, r2Configured, signedGetUrl } from "@/lib/storage";

// Entrega publica de midia (Frente B).
//   publico -> redireciona para CDN (se houver dominio) ou URL assinada longa
//   privado -> exige login e plano >= planoMinimo; assina URL curta
// ?download=1 forca "salvar como".
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return NextResponse.json(
      { error: "Arquivo não encontrado" },
      { status: 404 },
    );
  }

  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";

  // Conteudo publico: prioriza o dominio/CDN estavel; senao assina uma URL longa.
  if (asset.visibilidade === "publico") {
    const cdn = publicUrl(asset.key);
    if (cdn) return NextResponse.redirect(cdn, 302);
    if (!r2Configured()) {
      return NextResponse.json(
        { error: "Armazenamento indisponível" },
        { status: 503 },
      );
    }
    const signed = await signedGetUrl(asset.key, {
      expiresIn: 3600,
      downloadName: download ? asset.filename : undefined,
    });
    return NextResponse.redirect(signed, 302);
  }

  // Conteudo privado (pago): precisa de login e plano compativel.
  const user = await getSessionUser();
  if (!user) {
    const back = encodeURIComponent(`/api/midia/${id}`);
    return NextResponse.redirect(new URL(`/entrar?redirect=${back}`, req.url), 302);
  }
  if (!planoAtende(user.plano, asset.planoMinimo)) {
    return NextResponse.redirect(new URL("/clube", req.url), 302);
  }
  if (!r2Configured()) {
    return NextResponse.json(
      { error: "Armazenamento indisponível" },
      { status: 503 },
    );
  }

  const signed = await signedGetUrl(asset.key, {
    expiresIn: 300,
    downloadName: download ? asset.filename : undefined,
  });
  return NextResponse.redirect(signed, 302);
}
