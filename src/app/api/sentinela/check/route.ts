import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { runSentinela } from "@/lib/sentinela-runner";

// Ponto de entrada do CRON EXTERNO (ex.: cron-job.org), 2x/dia.
// Protegido por um segredo (SENTINELA_SECRET). Aceita GET e POST, com o token
// via header "Authorization: Bearer <segredo>", header "x-sentinela-token" ou
// query "?token=<segredo>". Responde 200 se tudo ok, 503 se algo esta fora
// (assim o proprio cron externo pode alertar por e-mail no futuro).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function tokenDaRequisicao(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  const h = req.headers.get("x-sentinela-token");
  if (h) return h.trim();
  const url = new URL(req.url);
  const q = url.searchParams.get("token");
  return q ? q.trim() : null;
}

// Comparacao em tempo constante (hash para igualar tamanhos com seguranca).
function segredoConfere(fornecido: string, esperado: string): boolean {
  const a = createHash("sha256").update(fornecido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

async function handle(req: Request) {
  const esperado = process.env.SENTINELA_SECRET?.trim();
  if (!esperado) {
    return NextResponse.json(
      { error: "Sentinela não configurado (defina SENTINELA_SECRET)." },
      { status: 503 },
    );
  }
  const fornecido = tokenDaRequisicao(req);
  if (!fornecido || !segredoConfere(fornecido, esperado)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const resultado = await runSentinela("cron");
  return NextResponse.json(resultado, { status: resultado.ok ? 200 : 503 });
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
