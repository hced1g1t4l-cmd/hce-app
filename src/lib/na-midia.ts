// Tipos e ajudantes compartilhados da seção pública "Na Mídia" (BAC_130).
// Usados pela página pública (/na-midia), pelo painel (/adm/na-midia) e pelas
// rotas de API. O conteúdo agora vive no banco (model MidiaItem); estes valores
// são apenas as opções fixas do editor (tipos, avatares e logos sugeridos).

export const MIDIA_TIPOS = [
  "Coluna",
  "Podcast",
  "Entrevista",
  "Vídeo",
  "Artigo",
] as const;

export type MidiaTipo = (typeof MIDIA_TIPOS)[number];

export function ehMidiaTipo(v: string): v is MidiaTipo {
  return (MIDIA_TIPOS as readonly string[]).includes(v);
}

export type LinkExtra = { label: string; url: string };

// Avatares sugeridos (fotos dos fundadores). O editor também aceita upload.
export const AVATARES_PRESET: { label: string; url: string }[] = [
  { label: "Cris Leite", url: "/brand/fotos/chef-cris-4.png" },
  { label: "Gio Gropello", url: "/brand/fotos/chef-gio-5.png" },
];

// Logos de veículo disponíveis para o selo no canto da thumbnail.
export const LOGOS_PRESET: {
  label: string;
  url: string;
  classe: string;
}[] = [
  { label: "Extra", url: "/brand/midia/logo-extra.svg", classe: "h-4 w-auto" },
  {
    label: "Instagram",
    url: "/brand/midia/logo-instagram-color.svg",
    classe: "h-[18px] w-[18px]",
  },
];

// Normaliza o Json `linksExtras` do banco em uma lista limpa e confiável.
export function parseLinksExtras(v: unknown): LinkExtra[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const label = typeof o.label === "string" ? o.label.trim() : "";
      const url = typeof o.url === "string" ? o.url.trim() : "";
      if (!label || !url) return null;
      return { label, url } satisfies LinkExtra;
    })
    .filter((x): x is LinkExtra => x !== null)
    .slice(0, 6);
}

// Forma serializável de um card, consumida pela página pública.
export type MidiaCard = {
  id: string;
  tipo: MidiaTipo;
  veiculo: string;
  autor: string;
  titulo: string;
  descricao: string;
  url: string;
  linksExtras: LinkExtra[];
  thumb: string | null;
  thumbPos: string | null;
  avatar: string | null;
  logoVeiculo: string | null;
  logoAlt: string | null;
  logoClasse: string | null;
};
