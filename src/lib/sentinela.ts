// Sentinela - celula de monitoramento ativo da infra (/adm/sentinela).
// Reune as definicoes das checagens de saude, os limites de referencia do
// plano Neon e helpers de formatacao. A logica de execucao fica no
// "sentinela-runner.ts"; aqui ficam so tipos e constantes puras (sem I/O).

// --- Assinaturas dos incidentes automaticos (chave de deduplicacao) ---
// Cada problema detectavel tem uma assinatura estavel. Enquanto houver um
// incidente ativo (aberto/em_andamento) com a mesma assinatura, o Sentinela
// nao abre outro: apenas anexa uma nova ocorrencia.
export const ASSINATURAS = {
  DB_DOWN: "db_down",
  NA_MIDIA_DOWN: "na_midia_down",
  DB_GRANDE: "db_grande",
  NEON_ALTO_CONSUMO: "neon_alto_consumo",
} as const;

// Percentual de compute-hours do ciclo (vs. referencia do plano) a partir do
// qual o Sentinela abre um incidente PROATIVO ("banco perto de estourar").
// Ajustavel pela env SENTINELA_NEON_ALERTA_PCT (default 80).
export function limiteAlertaNeonPct(): number {
  const raw = process.env.SENTINELA_NEON_ALERTA_PCT;
  const n = raw ? Number(raw) : NaN;
  if (Number.isFinite(n) && n > 0 && n <= 100) return n;
  return 80;
}

export type Assinatura = (typeof ASSINATURAS)[keyof typeof ASSINATURAS];

// Nome exibido como "autor" dos registros automaticos.
export const SENTINELA_AUTOR = "Sentinela 🛡️";

// --- Plano Neon (referencia informativa para o painel) ---
// Nao sao limites rigidos (o Launch e usage-based), mas servem de baliza visual
// para acompanhar o crescimento do banco antes de "estourar".
export const NEON_PLANO = {
  nome: "Launch",
  // Armazenamento incluido no plano (bytes). Launch inclui ~10 GB.
  storageIncluidoBytes: 10 * 1024 ** 3,
  // Compute incluido no ciclo (horas). Referencia do Launch.
  computeIncluidoHoras: 300,
} as const;

// Threshold opcional para alertar que o banco esta crescendo demais.
// Definido em MB pela env SENTINELA_DB_ALERTA_MB (0/ausente = desligado).
export function limiteAlertaDbBytes(): number | null {
  const raw = process.env.SENTINELA_DB_ALERTA_MB;
  if (!raw) return null;
  const mb = Number(raw);
  if (!Number.isFinite(mb) || mb <= 0) return null;
  return Math.round(mb * 1024 * 1024);
}

// --- Tipos partilhados entre runner, API e painel ---

export type CheckItem = {
  chave: string; // ex.: "db", "na_midia", "db_size", "neon"
  label: string; // rotulo amigavel
  ok: boolean;
  critico: boolean; // se false, nao derruba o "ok" consolidado
  detalhe: string; // mensagem curta (ex.: "conectado em 47ms")
};

export type SentinelaResultado = {
  ok: boolean;
  origem: string;
  quando: string; // ISO
  itens: CheckItem[];
  incidentesAbertos: string[]; // titulos abertos nesta execucao
  incidentesResolvidos: string[]; // titulos auto-resolvidos nesta execucao
};

// --- Formatacao ---

export function formatarBytes(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

export function formatarHoras(segundos: number | null | undefined): string {
  if (segundos == null || !Number.isFinite(segundos)) return "—";
  const h = segundos / 3600;
  if (h < 10) return `${h.toFixed(1)} h`;
  return `${Math.round(h)} h`;
}

// Percentual de uso (0..100+) com 1 casa; null se sem base.
export function percentual(
  usado: number | null | undefined,
  total: number,
): number | null {
  if (usado == null || !Number.isFinite(usado) || total <= 0) return null;
  return Math.round((usado / total) * 1000) / 10;
}

// Cor do "semaforo" a partir do resultado consolidado.
export function semaforo(ok: boolean): {
  label: string;
  badge: string;
  dot: string;
} {
  return ok
    ? {
        label: "Tudo no ar",
        badge: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
        dot: "bg-emerald-500",
      }
    : {
        label: "Atenção",
        badge: "bg-red-100 text-red-800 ring-1 ring-red-200",
        dot: "bg-red-500",
      };
}
