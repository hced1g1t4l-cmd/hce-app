import sanitizeHtml from "sanitize-html";

// Sanitizacao de HTML rico vindo dos editores do painel (artigos e backlog).
// Objetivo: impedir XSS armazenado (scripts, on*=, javascript:, iframes, etc.)
// mantendo a formatacao que o editor TipTap realmente produz.

const COR = [
  /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
  /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
  /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
  /^[a-zA-Z]+$/, // nomes de cor (red, transparent, etc.)
];

const OPCOES: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "strike", "mark", "sub", "sup", "small",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "blockquote", "pre", "code",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel", "title"],
    img: ["src", "alt", "title", "width", "height", "class"],
    // Figura com legenda de autor (crédito) da foto no corpo da matéria.
    figure: ["class"],
    figcaption: ["class"],
    "*": ["style"],
  },
  // Restringe a classe a valores conhecidos do editor (evita CSS arbitrário).
  allowedClasses: {
    img: ["materia-img"],
    figure: ["materia-figure"],
    figcaption: ["materia-credito"],
  },
  allowedStyles: {
    "*": {
      color: COR,
      "background-color": COR,
      "font-size": [/^\d+(?:\.\d+)?(?:px|em|rem|pt|%)$/],
      "text-align": [/^(?:left|right|center|justify)$/],
      "font-weight": [/^(?:normal|bold|bolder|lighter|[1-9]00)$/],
      "font-style": [/^(?:normal|italic|oblique)$/],
      "text-decoration": [/^(?:none|underline|line-through|overline)(?:\s+\w+)*$/],
    },
  },
  // Esquemas seguros em links; bloqueia javascript:, data: e vbscript:.
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https"] },
  // Bloqueia URLs protocolo-relativas (//evil.com). URLs relativas comuns
  // (ex.: /api/img/... , /api/midia/...) continuam permitidas.
  allowProtocolRelative: false,
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    // Todo link externo abre com rel de seguranca.
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
    }),
  },
};

export function sanitizarHtml(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, OPCOES);
}
