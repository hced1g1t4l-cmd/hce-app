import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/adm";
import { r2Configured, signedPutUrl } from "@/lib/storage";
import { MAX_BYTES, montarKey, tipoPermitido } from "@/lib/midia";

// Frente B: gera uma URL assinada para o navegador enviar o arquivo DIRETO ao
// Cloudflare R2, sem passar pela funcao serverless (que limita o corpo a ~4,5 MB).
// Fluxo: presign (aqui) -> PUT direto no R2 -> POST /api/adm/midia (confirmar).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!tipoPermitido(mime, filename)) {
    return NextResponse.json(
      {
        error:
          "Tipo de arquivo não permitido. Envie imagens (JPG, PNG, WEBP, GIF), PDF, e-books (EPUB) ou planilhas/documentos. SVG não é aceito.",
      },
      { status: 415 },
    );
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
    // Loga o detalhe tecnico no servidor, mas nao expoe nome de bucket,
    // credencial ou mensagem interna do R2 para o cliente.
    const err = e as { name?: string; message?: string };
    console.error(
      "[midia/presign] falha ao assinar URL:",
      `${err?.name || "Erro"}: ${err?.message || "desconhecido"}`,
    );
    return NextResponse.json(
      {
        error:
          "Não foi possível preparar o envio. Tente novamente em instantes.",
      },
      { status: 502 },
    );
  }
}
