// Definicoes do modulo de Gestao de Incidentes (/adm/incidentes).
// Espelha o padrao do backlog: status com badge, codigo sequencial e acoes de
// transicao. O "detalhamento" e texto simples (nao HTML).

export type Severidade = "alta" | "media" | "baixa";
export type IncidenteStatus =
  | "aberto"
  | "em_andamento"
  | "resolvido"
  | "cancelado";

export const SEVERIDADES: {
  valor: Severidade;
  label: string;
  badge: string;
  ordem: number;
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
  valor: IncidenteStatus;
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
    valor: "resolvido",
    label: "Resolvido",
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

export function severidadeInfo(v: string) {
  return SEVERIDADES.find((s) => s.valor === v) ?? SEVERIDADES[1];
}

export function statusInfo(v: string) {
  return STATUS.find((s) => s.valor === v) ?? STATUS[0];
}

export function severidadeValida(v: unknown): v is Severidade {
  return v === "alta" || v === "media" || v === "baixa";
}

export function statusValido(v: unknown): v is IncidenteStatus {
  return (
    v === "aberto" ||
    v === "em_andamento" ||
    v === "resolvido" ||
    v === "cancelado"
  );
}

// Acoes de transicao permitidas na UI/API.
export type IncidenteAcao = "iniciar" | "resolver" | "cancelar" | "reabrir";

export const ACAO_LABEL: Record<IncidenteAcao, string> = {
  iniciar: "Pegar para tratar",
  resolver: "Resolver",
  cancelar: "Cancelar",
  reabrir: "Reabrir",
};

// Codigo sequencial exibivel a partir do numero (INC_001, INC_002...).
export function codigoIncidente(num: number): string {
  return `INC_${String(num).padStart(3, "0")}`;
}

export function statusAtivo(status: string): boolean {
  return status === "aberto" || status === "em_andamento";
}

// --- Data de abertura ---
// O <input type="date"> usa "YYYY-MM-DD". Para evitar off-by-one entre UTC e
// America/Sao_Paulo, guardamos o meio-dia UTC do dia escolhido. Se vier vazio,
// retorna null (o chamador cai para "agora").
export function dataAberturaDoInput(
  v: string | null | undefined,
): Date | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v.trim());
  if (!m) return null;
  const ano = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
}

// Dia-calendario (YYYY-MM-DD) em Sao Paulo, para preencher o input date.
export function dataParaInput(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
