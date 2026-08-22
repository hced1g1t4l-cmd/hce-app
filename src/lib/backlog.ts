// Definicoes do modulo de backlog interno (/adm/backlog).

export type Prioridade = "alta" | "media" | "baixa";
export type BacklogStatus =
  | "aberto"
  | "em_andamento"
  | "concluido"
  | "cancelado";

export const PRIORIDADES: {
  valor: Prioridade;
  label: string;
  // classes Tailwind do "badge"
  badge: string;
  ordem: number; // para ordenar (alta primeiro)
}[] = [
  {
    valor: "alta",
    label: "Alta",
    badge: "bg-red-100 text-red-800 ring-1 ring-red-200",
    ordem: 0,
  },
  {
    valor: "media",
    label: "Média",
    badge: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    ordem: 1,
  },
  {
    valor: "baixa",
    label: "Baixa",
    badge: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    ordem: 2,
  },
];

export const STATUS: {
  valor: BacklogStatus;
  label: string;
  badge: string;
  ordem: number;
}[] = [
  {
    valor: "aberto",
    label: "Aberto",
    badge: "bg-sky-100 text-sky-800 ring-1 ring-sky-200",
    ordem: 0,
  },
  {
    valor: "em_andamento",
    label: "Em andamento",
    badge: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
    ordem: 1,
  },
  {
    valor: "concluido",
    label: "Concluído",
    badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    ordem: 2,
  },
  {
    valor: "cancelado",
    label: "Cancelado",
    badge: "bg-slate-200 text-slate-600 ring-1 ring-slate-300",
    ordem: 3,
  },
];

export function prioridadeInfo(v: string) {
  return PRIORIDADES.find((p) => p.valor === v) ?? PRIORIDADES[1];
}

export function statusInfo(v: string) {
  return STATUS.find((s) => s.valor === v) ?? STATUS[0];
}

export function prioridadeValida(v: unknown): v is Prioridade {
  return v === "alta" || v === "media" || v === "baixa";
}

export function statusValido(v: unknown): v is BacklogStatus {
  return (
    v === "aberto" ||
    v === "em_andamento" ||
    v === "concluido" ||
    v === "cancelado"
  );
}

// Acoes de transicao permitidas na UI/API.
export type BacklogAcao = "iniciar" | "concluir" | "cancelar" | "reabrir";

export const ACAO_LABEL: Record<BacklogAcao, string> = {
  iniciar: "Pegar para fazer",
  concluir: "Concluir",
  cancelar: "Cancelar",
  reabrir: "Reabrir",
};

// Codigo sequencial exibivel a partir do numero (BAC_001, BAC_002...).
export function codigoBacklog(num: number): string {
  return `BAC_${String(num).padStart(3, "0")}`;
}

// --- Prazo (data de vencimento) ---
// O <input type="date"> trabalha em "YYYY-MM-DD". Para evitar off-by-one entre
// UTC e America/Sao_Paulo (UTC-3), armazenamos SEMPRE o meio-dia UTC do dia
// escolhido: em Sao Paulo isso cai as 9h do MESMO dia, entao a data-calendario
// nunca muda ao formatar. Toda leitura/formatacao usa America/Sao_Paulo.
export const TZ_BR = "America/Sao_Paulo";

// Converte "YYYY-MM-DD" (input date) para Date armazenavel. null se invalido.
export function prazoDoInput(v: string | null | undefined): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
}

// Dia-calendario (YYYY-MM-DD) em Sao Paulo, para input date e comparacoes.
export function prazoParaInput(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ_BR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

// dd/mm/aaaa em Sao Paulo (exibicao na tabela/export).
export function prazoParaBR(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ_BR,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

// Diferenca em dias-calendario (Sao Paulo) entre o prazo e "agora".
// Negativo = ja venceu; 0 = vence hoje; 3 = vence em 3 dias.
export function diasAteVencer(prazo: Date, agora: Date = new Date()): number {
  const diaUTC = (d: Date) => {
    const [y, mo, da] = prazoParaInput(d).split("-").map(Number);
    return Date.UTC(y, mo - 1, da);
  };
  return Math.round((diaUTC(prazo) - diaUTC(agora)) / 86_400_000);
}

export type PrazoAlerta = "vencido" | "proximo" | null;

// So itens ativos (aberto/em andamento) recebem alerta de vencimento.
export function statusAtivo(status: string): boolean {
  return status === "aberto" || status === "em_andamento";
}

// Regra do alerta: vencido (dias<0) ou proximo (0..3 dias). Concluido/cancelado
// nunca alerta. Retorna o tipo e os dias para o rotulo textual acessivel.
export function alertaPrazo(
  prazo: Date | null,
  status: string,
  agora: Date = new Date(),
): { tipo: PrazoAlerta; dias: number | null } {
  if (!prazo || !statusAtivo(status)) return { tipo: null, dias: null };
  const dias = diasAteVencer(prazo, agora);
  if (dias < 0) return { tipo: "vencido", dias };
  if (dias <= 3) return { tipo: "proximo", dias };
  return { tipo: null, dias };
}
