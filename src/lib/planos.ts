// Hierarquia dos planos do +HCE. Usada para liberar conteudo por nivel
// (ex.: uma ficha "profissional" so abre para quem tem profissional ou premium).
export const PLANOS = ["free", "essencial", "profissional", "premium"] as const;
export type Plano = (typeof PLANOS)[number];

export const PLANO_LABEL: Record<Plano, string> = {
  free: "Gratuito",
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

function nivel(plano: string): number {
  const i = PLANOS.indexOf(plano as Plano);
  return i < 0 ? 0 : i;
}

// true se `plano` do usuario atende ao `minimo` exigido pelo conteudo.
export function planoAtende(plano: string, minimo: string): boolean {
  return nivel(plano) >= nivel(minimo);
}
