import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adm";
import { r2Configured, signedPutUrl } from "@/lib/storage";
import { MAX_BYTES, montarKey } from "@/lib/midia";

// Frente B: gera uma URL assinada para o navegador enviar o arquivo DIRETO ao
// Cloudflare R2, sem passar pela funcao serverless (que limita o corpo a ~4,5 MB).
// Fluxo: presign (aqui) -> PUT direto no R2 -> POST /api/adm/midia (confirmar).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  let body: { filename?: string; mime?: string; size?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const filename = (body.filename || "").trim();
  const mime = (body.mime || "application/octet-stream").trim();
  const size = Number(body.size) || 0;

  if (!filename) {
    return NextResponse.json({ error: "Nome do arquivo ausente" }, { status: 400 });
  }
  if (size <= 0) {
    return NextResponse.json({ error: "Arquivo vazio" }, { status: 400 });
  }
  if (size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máximo 50 MB)" },
      { status: 413 },
    );
  }

  const key = montarKey(mime, filename);

  try {
    const url = await signedPutUrl(key, mime);
    return NextResponse.json({ url, key, mime });
  } catch (e) {
    const err = e as { name?: string; message?: string };
    const detalhe = `${err?.name || "Erro"}: ${err?.message || "desconhecido"}`;
    console.error("[midia/presign] falha ao assinar URL:", detalhe);
    return NextResponse.json(
      { error: `Não foi possível preparar o envio — ${detalhe}` },
      { status: 502 },
    );
  }
}
