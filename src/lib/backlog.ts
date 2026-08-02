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
