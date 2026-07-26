import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Rota de diagnostico: confirma que o app esta no ar e que consegue falar com
// o banco (Neon). Util para checar producao apos deploy e para monitoramento.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      db: "connected",
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Loga o detalhe no servidor (Vercel), mas NAO expoe na resposta publica
    // para nao vazar host/credenciais do banco em mensagens de erro.
    console.error("[health] falha ao conectar no banco:", error);
    return NextResponse.json(
      {
        status: "error",
        db: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
