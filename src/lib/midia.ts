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
