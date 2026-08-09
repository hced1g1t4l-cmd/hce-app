import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";

// Recebe o tempo de permanencia (beacon) de um acesso ao Feed (BAC_109).
// O acesso ja foi criado no servidor ao carregar a pagina; aqui so gravamos a
// duracao. Verifica que o registro pertence ao usuario logado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MS = 2 * 60 * 60 * 1000; // 2h — teto anti-lixo

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return new NextResponse(null, { status: 204 });

  let body: { id?: unknown; durationMs?: unknown };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const durNum =
    typeof body.durationMs === "number" && Number.isFinite(body.durationMs)
      ? Math.round(body.durationMs)
      : NaN;
  if (!id || Number.isNaN(durNum) || durNum < 1000) {
    // < 1s ou payload invalido: nao registra
    return new NextResponse(null, { status: 204 });
  }
  const durationMs = Math.min(durNum, MAX_MS);

  // updateMany garante o filtro por dono sem vazar existencia do registro.
  await prisma.feedAcesso.updateMany({
    where: { id, userId: user.id },
    data: { durationMs },
  });

  return new NextResponse(null, { status: 204 });
}
