import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdmin, logAdm } from "@/lib/adm";
import { getClientIp } from "@/lib/anti-bot";

// Resposta oficial da HCE a um comentario do Feed (BAC_108). Ja nasce
// "aprovado" (autor confiavel/autenticado no /adm) e aponta para o
// comentario respondido via parentId. Texto puro (sem HTML).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  if (admin.precisaTrocarSenha) {
    return NextResponse.json(
      { error: "Troque a sua senha antes de continuar." },
      { status: 403 },
    );
  }

  let body: { parentId?: unknown; texto?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const parentId = typeof body.parentId === "string" ? body.parentId : "";
  const texto =
    typeof body.texto === "string" ? body.texto.trim().slice(0, 2000) : "";
  if (!parentId || texto.length < 2) {
    return NextResponse.json({ error: "Escreva uma resposta." }, { status: 400 });
  }

  // Só respondemos a comentários de 1º nível (1 nível de aninhamento).
  const pai = await prisma.comentario.findUnique({
    where: { id: parentId },
    select: {
      id: true,
      artigoId: true,
      parentId: true,
      artigo: { select: { titulo: true } },
    },
  });
  if (!pai || pai.parentId !== null) {
    return NextResponse.json(
      { error: "Não é possível responder a este comentário." },
      { status: 400 },
    );
  }

  await prisma.comentario.create({
    data: {
      artigoId: pai.artigoId,
      parentId: pai.id,
      adminId: admin.id,
      texto,
      status: "aprovado",
      moderadoEm: new Date(),
      moderadoPor: admin.login,
    },
  });

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "comentario.responder",
    detalhe: pai.artigo?.titulo ?? pai.id,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true });
}
