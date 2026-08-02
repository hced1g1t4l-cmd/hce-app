// Reacoes disponiveis nos artigos do Feed HCE (todas positivas, estilo LinkedIn).
// A ordem aqui e a ordem de exibicao.

export type ReacaoTipo = "gostei" | "amei" | "aplausos" | "inspirador";

export type ReacaoDef = {
  tipo: ReacaoTipo;
  label: string;
  emoji: string;
};

export const REACOES: ReacaoDef[] = [
  { tipo: "gostei", label: "Gostei", emoji: "👍" },
  { tipo: "amei", label: "Amei", emoji: "❤️" },
  { tipo: "aplausos", label: "Aplausos", emoji: "👏" },
  { tipo: "inspirador", label: "Inspirador", emoji: "💡" },
];

export const REACAO_TIPOS: ReacaoTipo[] = REACOES.map((r) => r.tipo);

export function reacaoValida(v: unknown): v is ReacaoTipo {
  return typeof v === "string" && REACAO_TIPOS.includes(v as ReacaoTipo);
}

export function reacaoDef(tipo: string): ReacaoDef | undefined {
  return REACOES.find((r) => r.tipo === tipo);
}

export type ContagemReacoes = Record<ReacaoTipo, number>;

export function contagemZero(): ContagemReacoes {
  return { gostei: 0, amei: 0, aplausos: 0, inspirador: 0 };
}
