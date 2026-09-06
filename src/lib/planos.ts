// Hierarquia dos planos do +HCE. Usada para liberar conteudo por nivel
// (ex.: uma ficha "profissional" so abre para quem tem profissional ou premium).
export const PLANOS = ["free", "essencial", "profissional", "premium"] as const;
export type Plano = (typeof PLANOS)[number];

// Nota: a chave interna continua "essencial" (evita migração de dados de
// usuários e de mídia por plano); o rótulo exibido é "Básico" (BAC_131).
export const PLANO_LABEL: Record<Plano, string> = {
  free: "Gratuito",
  essencial: "Básico",
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

// ---------------------------------------------------------------------------
// Precos do Clube +HCE (Fase 2 — checkout). FONTE DA VERDADE no servidor: o
// cliente nunca envia valor; a rota de checkout resolve o preco por (plano,
// ciclo) aqui. Valores em CENTAVOS para evitar erro de ponto flutuante.
//
// "anual"  = compromisso anual, cobrado mensalmente mais barato.
// "avulso" = mes a mes, sem compromisso, um pouco mais caro.
// Devem espelhar os rotulos exibidos em components/site/clube-planos.tsx.
// ---------------------------------------------------------------------------
export const PLANOS_PAGOS = ["essencial", "profissional"] as const;
export type PlanoPago = (typeof PLANOS_PAGOS)[number];

export const CICLOS = ["anual", "avulso"] as const;
export type Ciclo = (typeof CICLOS)[number];

export const PRECOS_CENTAVOS: Record<PlanoPago, Record<Ciclo, number>> = {
  essencial: { anual: 2990, avulso: 3490 },
  profissional: { anual: 5990, avulso: 6490 },
};

export function ehPlanoPago(v: string): v is PlanoPago {
  return (PLANOS_PAGOS as readonly string[]).includes(v);
}

export function ehCiclo(v: string): v is Ciclo {
  return (CICLOS as readonly string[]).includes(v);
}

/** Preco em centavos para (plano, ciclo). */
export function precoCentavos(plano: PlanoPago, ciclo: Ciclo): number {
  return PRECOS_CENTAVOS[plano][ciclo];
}
