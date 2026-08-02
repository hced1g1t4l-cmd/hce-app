import { NextResponse } from "next/server";
import { getAdmin, logAdm, type AdminSessao } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { deleteObject, putObject, r2Configured } from "@/lib/storage";
import { PLANOS } from "@/lib/planos";
import { MAX_BYTES, montarKey, tipoDe, keyValida } from "@/lib/midia";
import { getClientIp } from "@/lib/anti-bot";

// Frente B: gerencia a biblioteca de midia (fichas, e-books, planilhas, imagens).
// Protegido pelo login do /adm. Os bytes vao para o Cloudflare R2; o metadado, no Postgres.
//
// Dois fluxos de POST:
//  - JSON  -> confirmacao: o arquivo ja foi enviado direto ao R2 via URL assinada
//             (presign). Aqui so gravamos o metadado. Ignora o limite de ~4,5 MB
//             da funcao serverless -> ideal para e-books/fichas grandes.
//  - multipart/form-data -> upload pelo servidor (fallback p/ arquivos pequenos).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizarPlano(v: string | null): string {
  const plano = v || "free";
  return PLANOS.includes(plano as (typeof PLANOS)[number]) ? plano : "free";
}

async function logMidia(
  admin: AdminSessao,
  req: Request,
  acao: string,
  detalhe: string,
) {
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao,
    detalhe,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
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

  const contentType = req.headers.get("content-type") || "";

  // -------- Fluxo 1: confirmacao (arquivo ja no R2 via URL assinada) --------
  if (contentType.includes("application/json")) {
    let body: {
      key?: string;
      filename?: string;
      titulo?: string;
      mime?: string;
      size?: number;
      visibilidade?: string;
      planoMinimo?: string;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
    }

    if (!keyValida(body.key)) {
      return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
    }
    const filename = (body.filename || "arquivo").trim();
    const mime = (body.mime || "application/octet-stream").trim();
    const tamanho = Number(body.size) || 0;
    if (tamanho > MAX_BYTES) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máximo 50 MB)" },
        { status: 413 },
      );
    }
    const titulo = (body.titulo || "").trim() || null;
    const visibilidade = body.visibilidade === "publico" ? "publico" : "privado";
    const planoMinimo =
      visibilidade === "publico" ? "free" : normalizarPlano(body.planoMinimo ?? null);
    const tipo = tipoDe(mime, filename);

    const asset = await prisma.mediaAsset.create({
      data: {
        key: body.key,
        filename,
        titulo,
        mime,
        tamanho,
        tipo,
        visibilidade,
        planoMinimo,
      },
    });
    await logMidia(admin, req, "midia.enviar", asset.titulo || asset.filename);
    return NextResponse.json({ id: asset.id, url: `/api/midia/${asset.id}` });
  }

  // -------- Fluxo 2: upload pelo servidor (fallback, arquivos pequenos) --------
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
  const planoMinimo =
    visibilidade === "publico"
      ? "free"
      : normalizarPlano(form.get("planoMinimo") as string | null);

  const mime = file.type || "application/octet-stream";
  const tipo = tipoDe(mime, file.name);
  const key = montarKey(mime, file.name);

  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    await putObject(key, bytes, mime);
  } catch (e) {
    // Erros do S3/R2 trazem "name" (ex.: AccessDenied, SignatureDoesNotMatch,
    // NoSuchBucket) e, as vezes, o codigo HTTP em $metadata. Expomos isso para
    // diagnosticar a causa real (credencial, bucket, permissao) direto na tela.
    const err = e as {
      name?: string;
      message?: string;
      Code?: string;
      $metadata?: { httpStatusCode?: number };
    };
    const nome = err?.name || err?.Code || "ErroDesconhecido";
    const msg = err?.message || "erro desconhecido no armazenamento";
    const http = err?.$metadata?.httpStatusCode;
    const detalhe = `${nome}${http ? ` (HTTP ${http})` : ""}: ${msg}`;
    console.error("[midia] falha no upload R2:", detalhe, err);
    return NextResponse.json(
      { error: `Falha ao enviar para o armazenamento — ${detalhe}` },
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

  await logMidia(admin, req, "midia.enviar", asset.titulo || asset.filename);
  return NextResponse.json({ id: asset.id, url: `/api/midia/${asset.id}` });
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
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

  await logMidia(admin, req, "midia.excluir", asset.titulo || asset.filename);
  return NextResponse.json({ ok: true });
}
