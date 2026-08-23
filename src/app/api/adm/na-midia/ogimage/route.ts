import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";

// Busca automática de thumbnail a partir de uma URL (BAC_130): lê a og:image
// (ou twitter:image) da página, baixa a imagem e a guarda localmente na tabela
// Imagem, devolvendo /api/img/{id} — mesma origem, sem depender de hotlink.
// Protegido pelo login do /adm.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2 MB de HTML
const MAX_IMG_BYTES = 6 * 1024 * 1024; // 6 MB de imagem
const ALLOWED_IMG = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
const UA =
  "Mozilla/5.0 (compatible; HCEbot/1.0; +https://www.hcegastronomia.com)";

// Bloqueia alvos internos óbvios (defesa simples contra SSRF). Admin-only.
function hostSeguro(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (
    h === "localhost" ||
    h === "0.0.0.0" ||
    h === "::1" ||
    h.endsWith(".local") ||
    h.endsWith(".internal")
  ) {
    return false;
  }
  if (/^127\./.test(h) || /^10\./.test(h) || /^192\.168\./.test(h)) return false;
  if (/^169\.254\./.test(h)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  return true;
}

function urlValida(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (!hostSeguro(u.hostname)) return null;
  return u;
}

async function comTimeout(
  input: string,
  ms: number,
  init?: RequestInit,
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// Extrai a melhor imagem social da página (og:image e variações, twitter:image).
function extrairImagem(html: string): string | null {
  const tags = html.match(/<meta[^>]+>/gi) || [];
  const alvos = [
    "og:image:secure_url",
    "og:image:url",
    "og:image",
    "twitter:image",
    "twitter:image:src",
  ];
  const achados = new Map<string, string>();
  for (const tag of tags) {
    const key =
      tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const content = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
    if (key && content && alvos.includes(key) && !achados.has(key)) {
      achados.set(key, content);
    }
  }
  for (const a of alvos) {
    const v = achados.get(a);
    if (v) return v;
  }
  return null;
}

export async function GET(req: Request) {
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

  const alvo = new URL(req.url).searchParams.get("url")?.trim() || "";
  const pagina = urlValida(alvo);
  if (!pagina) {
    return NextResponse.json(
      { error: "URL inválida ou não permitida." },
      { status: 400 },
    );
  }

  // 1) Baixa o HTML da página.
  let html = "";
  try {
    const res = await comTimeout(pagina.toString(), 10000, {
      headers: { "user-agent": UA, accept: "text/html,*/*" },
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `A página respondeu ${res.status}.` },
        { status: 422 },
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    html = buf.subarray(0, MAX_HTML_BYTES).toString("utf8");
  } catch {
    return NextResponse.json(
      { error: "Não foi possível acessar a página." },
      { status: 422 },
    );
  }

  const bruto = extrairImagem(html);
  if (!bruto) {
    return NextResponse.json(
      { error: "A página não expõe uma imagem (og:image)." },
      { status: 404 },
    );
  }

  // 2) Resolve URL relativa e valida o alvo da imagem.
  const imgUrl = urlValida(new URL(bruto, pagina).toString());
  if (!imgUrl) {
    return NextResponse.json(
      { error: "A imagem encontrada não é acessível." },
      { status: 422 },
    );
  }

  // 3) Baixa a imagem e valida tipo/tamanho.
  let bytes: Buffer;
  let mime: string;
  try {
    const res = await comTimeout(imgUrl.toString(), 10000, {
      headers: { "user-agent": UA, accept: "image/*" },
      redirect: "follow",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `A imagem respondeu ${res.status}.` },
        { status: 422 },
      );
    }
    mime = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_IMG.includes(mime)) {
      return NextResponse.json(
        { error: "Formato de imagem não suportado." },
        { status: 415 },
      );
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > MAX_IMG_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande (máximo 6 MB)." },
        { status: 413 },
      );
    }
    bytes = buf;
  } catch {
    return NextResponse.json(
      { error: "Não foi possível baixar a imagem." },
      { status: 422 },
    );
  }

  // 4) Guarda localmente e devolve a URL pública estável.
  const img = await prisma.imagem.create({
    data: { mime, dados: new Uint8Array(bytes) },
  });
  return NextResponse.json({ url: `/api/img/${img.id}`, source: imgUrl.toString() });
}
