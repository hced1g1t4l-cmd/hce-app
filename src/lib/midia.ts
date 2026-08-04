import crypto from "crypto";

// Helpers compartilhados da biblioteca de midia (Frente B).
// Usados tanto no upload direto (server) quanto no fluxo de URL assinada (presign).

export const MAX_BYTES = 50 * 1024 * 1024; // 50 MB (PDFs/e-books)

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

export function tipoDe(mime: string, name: string): string {
  for (const t of TIPOS) if (t.test(mime, name)) return t.tipo;
  return "outro";
}

// Allowlist de tipos aceitos na biblioteca. Bloqueia explicitamente formatos
// que podem carregar script (SVG, HTML, XML, JS) e so aceita imagens/documentos
// conhecidos — mesmo quando o navegador manda um mime generico.
const MIME_PERIGOSO =
  /(svg|html|xhtml|xml|javascript|ecmascript|x-httpd|x-msdownload|x-sh)/i;
const EXT_PERIGOSA =
  /\.(svgz?|html?|xhtml|xml|js|mjs|cjs|sh|bat|cmd|exe|com|scr|php|phtml|htaccess)$/i;
const EXT_PERMITIDA =
  /\.(pdf|epub|csv|xlsx?|ods|docx?|odt|pptx?|txt|jpe?g|png|webp|gif|avif|heic|bmp|tiff?)$/i;
const MIME_PERMITIDO = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/bmp",
  "image/tiff",
  "application/pdf",
  "application/epub+zip",
  "text/csv",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

// true quando o arquivo pode ser aceito na midia. Nunca aceita SVG/HTML/JS.
export function tipoPermitido(mime: string, name: string): boolean {
  const m = (mime || "").toLowerCase();
  const n = (name || "").toLowerCase();
  if (MIME_PERIGOSO.test(m) || EXT_PERIGOSA.test(n)) return false;
  if (MIME_PERMITIDO.has(m)) return true;
  // Mime generico (ex.: application/octet-stream): decide pela extensao segura.
  return EXT_PERMITIDA.test(n);
}

export function sanitize(name: string): string {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 120) || "arquivo"
  );
}

// Gera a chave (caminho) do objeto no R2: "<tipo>/<uuid>-<nome-sanitizado>".
export function montarKey(mime: string, filename: string): string {
  const tipo = tipoDe(mime, filename);
  const safe = sanitize(filename);
  return `${tipo}/${crypto.randomUUID()}-${safe}`;
}

// Valida que a chave veio no formato esperado (evita gravar metadado de chave
// arbitraria enviada pelo cliente no passo de confirmacao).
export function keyValida(key: unknown): key is string {
  return (
    typeof key === "string" &&
    /^(imagem|pdf|ebook|planilha|outro)\/[a-f0-9-]{36}-[a-zA-Z0-9._-]+$/.test(
      key,
    )
  );
}
