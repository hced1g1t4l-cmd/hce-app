import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import {
  reacaoValida,
  contagemZero,
  type ContagemReacoes,
  type ReacaoTipo,
} from "@/lib/reacoes";

// Define/alterna a reacao do usuario logado num artigo. Uma reacao por
// usuario/artigo: clicar na mesma remove; clicar em outra troca.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function contar(artigoId: string): Promise<ContagemReacoes> {
  const grupos = await prisma.artigoReacao.groupBy({
    by: ["tipo"],
    where: { artigoId },
    _count: { tipo: true },
  });
  const c = contagemZero();
  for (const g of grupos) {
    if (g.tipo in c) c[g.tipo as ReacaoTipo] = g._count.tipo;
  }
  return c;
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !user.emailVerificado) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: { artigoId?: unknown; tipo?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const artigoId = typeof body.artigoId === "string" ? body.artigoId : "";
  if (!artigoId || !reacaoValida(body.tipo)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const tipo = body.tipo;

  const artigo = await prisma.artigo.findFirst({
    where: { id: artigoId, publicado: true },
    select: { id: true },
  });
  if (!artigo) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  const existente = await prisma.artigoReacao.findUnique({
    where: { artigoId_userId: { artigoId, userId: user.id } },
    select: { tipo: true },
  });

  let minha: ReacaoTipo | null = tipo;
  if (existente && existente.tipo === tipo) {
    // Mesma reacao -> desmarca.
    await prisma.artigoReacao.delete({
      where: { artigoId_userId: { artigoId, userId: user.id } },
    });
    minha = null;
  } else {
    await prisma.artigoReacao.upsert({
      where: { artigoId_userId: { artigoId, userId: user.id } },
      create: { artigoId, userId: user.id, tipo },
      update: { tipo },
    });
  }

  const contagem = await contar(artigoId);
  return NextResponse.json({ ok: true, minha, contagem });
}
