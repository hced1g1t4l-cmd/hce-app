// Rate-limit global via Postgres (todas as instancias Vercel compartilham).
// Se o banco falhar, cai no bucket em memoria desta instancia.

import { prisma } from "@/lib/db";

type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();

export type RateResult = { ok: boolean; retryAfterSec: number };

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateResult {
  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
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

/**
 * Consome 1 tentativa para `key`. Permite ate `limit` tentativas por `windowMs`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateResult> {
  const now = new Date();
  try {
    const row = await prisma.rateLimitBucket.findUnique({ where: { key } });
    if (!row || row.resetAt <= now) {
      await prisma.rateLimitBucket.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          resetAt: new Date(Date.now() + windowMs),
        },
        update: {
          count: 1,
          resetAt: new Date(Date.now() + windowMs),
        },
      });
      return { ok: true, retryAfterSec: 0 };
    }
    if (row.count >= limit) {
      return {
        ok: false,
        retryAfterSec: Math.max(
          1,
          Math.ceil((row.resetAt.getTime() - Date.now()) / 1000),
        ),
      };
    }
    await prisma.rateLimitBucket.update({
      where: { key },
      data: { count: { increment: 1 } },
    });
    return { ok: true, retryAfterSec: 0 };
  } catch {
    return memoryLimit(key, limit, windowMs);
  }
}
