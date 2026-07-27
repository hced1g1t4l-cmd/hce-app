// Utilidades do Feed HCE (F1-5).

// Gera um slug amigavel a partir de um titulo (sem acentos, kebab-case).
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

// Formata data em pt-BR (ex.: "27 de julho de 2026").
const fmtLongo = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export function dataLonga(d: Date): string {
  return fmtLongo.format(d);
}
