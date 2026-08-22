import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import { normalizarHandle, validarHandle } from "@/lib/handle";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/anti-bot";

// Cria um comentario (status "pendente"). So aparece no site apos aprovacao
// no /adm. Exige que o usuario tenha um @ definido (na conta ou informado aqui).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !user.emailVerificado) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const ip = getClientIp(req) ?? "desconhecido";
  const rl = await rateLimit(`comentario:${user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Muitos comentários em pouco tempo. Tente mais tarde." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: {
    artigoId?: unknown;
    texto?: unknown;
    handle?: unknown;
    parentId?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const artigoId = typeof body.artigoId === "string" ? body.artigoId : "";
  const parentId =
    typeof body.parentId === "string" && body.parentId ? body.parentId : null;
  const texto =
    typeof body.texto === "string" ? body.texto.trim().slice(0, 2000) : "";
  if (!artigoId || texto.length < 2) {
    return NextResponse.json(
      { error: parentId ? "Escreva uma resposta." : "Escreva um comentário." },
      { status: 400 },
    );
  }

  const artigo = await prisma.artigo.findFirst({
    where: { id: artigoId, publicado: true },
    select: { id: true },
  });
  if (!artigo) {
    return NextResponse.json({ error: "Artigo não encontrado" }, { status: 404 });
  }

  // Resposta: o comentario-pai deve existir, ser do mesmo artigo, estar
  // aprovado e ser de 1o nivel (nao respondemos respostas — 1 nivel so).
  if (parentId) {
    const pai = await prisma.comentario.findUnique({
      where: { id: parentId },
      select: { id: true, artigoId: true, status: true, parentId: true },
    });
    if (
      !pai ||
      pai.artigoId !== artigoId ||
      pai.status !== "aprovado" ||
      pai.parentId !== null
    ) {
      return NextResponse.json(
        { error: "Não é possível responder a este comentário." },
        { status: 400 },
      );
    }
  }

  // Garante um @ para o usuario. Se ainda nao tem, aceita o que veio no corpo.
  let handle = user.handle;
  if (!handle) {
    const proposto = normalizarHandle(
      typeof body.handle === "string" ? body.handle : null,
    );
    if (!proposto) {
      return NextResponse.json(
        { error: "Defina um @ para comentar.", needsHandle: true },
        { status: 422 },
      );
    }
    const erroHandle = validarHandle(proposto);
    if (erroHandle) {
      return NextResponse.json(
        { error: erroHandle, needsHandle: true },
        { status: 422 },
      );
    }
    const usado = await prisma.user.findFirst({
      where: { handle: proposto, id: { not: user.id } },
      select: { id: true },
    });
    if (usado) {
      return NextResponse.json(
        { error: "Esse @ já está em uso. Escolha outro.", needsHandle: true },
        { status: 409 },
      );
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { handle: proposto },
    });
    handle = proposto;
  }

  await prisma.comentario.create({
    data: { artigoId, userId: user.id, texto, status: "pendente", parentId },
  });

  return NextResponse.json({
    ok: true,
    handle,
    message: parentId
      ? "Resposta enviada. Aparecerá após a aprovação da equipe."
      : "Comentário enviado. Aparecerá após a aprovação da equipe.",
  });
}
