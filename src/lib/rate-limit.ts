// Rate-limit best-effort em memoria (por instancia serverless).
// Nao e um limite global perfeito num ambiente com varias instancias, mas
// eleva bastante o custo de brute force / flood sem depender de Redis externo.
// Para limite global forte no futuro, trocar por Upstash Redis.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Limpeza preguicosa para nao crescer indefinidamente.
function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

export type RateResult = { ok: boolean; retryAfterSec: number };

/**
 * Consome 1 tentativa para `key`. Permite ate `limit` tentativas por `windowMs`.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  sweep(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { ok: true, retryAfterSec: 0 };
}
