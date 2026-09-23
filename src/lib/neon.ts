// Integracao read-only com a API da Neon para medir o consumo do ciclo atual
// (compute-hours e armazenamento) - o que realmente "estourou" no INC_001.
//
// Config por env (NUNCA em codigo):
//   NEON_API_KEY    - token pessoal da Neon (Account settings > API keys).
//   NEON_PROJECT_ID - id do projeto. Se ausente, usamos o primeiro projeto
//                     retornado pela conta.
//
// Sem NEON_API_KEY, tudo aqui vira no-op (retorna null): o painel apenas nao
// mostra a secao de compute, sem quebrar nada.

const NEON_API = "https://console.neon.tech/api/v2";

export type NeonConsumo = {
  projetoId: string;
  projetoNome: string | null;
  computeSegundos: number | null; // compute_time_seconds do ciclo
  storageBytes: number | null; // synthetic_storage_size
  periodoInicio: string | null; // ISO
  periodoFim: string | null; // ISO
};

function apiKey(): string | null {
  const k = process.env.NEON_API_KEY?.trim();
  return k ? k : null;
}

async function neonFetch(path: string, timeoutMs = 8000): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new Error("NEON_API_KEY ausente");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${NEON_API}${path}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Neon API ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

type NeonProject = {
  id: string;
  name?: string;
  compute_time_seconds?: number;
  synthetic_storage_size?: number;
  consumption_period_start?: string;
  consumption_period_end?: string;
};

async function resolverProjetoId(): Promise<string | null> {
  const fixo = process.env.NEON_PROJECT_ID?.trim();
  if (fixo) return fixo;
  // Sem id fixo: pega o primeiro projeto da conta.
  const data = (await neonFetch("/projects")) as { projects?: NeonProject[] };
  const primeiro = data.projects?.[0];
  return primeiro?.id ?? null;
}

// Retorna o consumo do ciclo atual, ou null se nao configurado / indisponivel.
// Best-effort: qualquer falha e engolida (logada) para nunca derrubar o check.
export async function neonConsumo(): Promise<NeonConsumo | null> {
  if (!apiKey()) return null;
  try {
    const projetoId = await resolverProjetoId();
    if (!projetoId) return null;
    const data = (await neonFetch(`/projects/${projetoId}`)) as {
      project?: NeonProject;
    };
    const p = data.project;
    if (!p) return null;
    return {
      projetoId,
      projetoNome: p.name ?? null,
      computeSegundos:
        typeof p.compute_time_seconds === "number"
          ? p.compute_time_seconds
          : null,
      storageBytes:
        typeof p.synthetic_storage_size === "number"
          ? p.synthetic_storage_size
          : null,
      periodoInicio: p.consumption_period_start ?? null,
      periodoFim: p.consumption_period_end ?? null,
    };
  } catch (e) {
    console.error("[neon] falha ao consultar consumo:", e);
    return null;
  }
}
