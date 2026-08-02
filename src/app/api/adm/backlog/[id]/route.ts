import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import { prioridadeValida, type BacklogAcao } from "@/lib/backlog";

// Transicoes de status e edicao de um item de backlog.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACOES: BacklogAcao[] = ["iniciar", "concluir", "cancelar", "reabrir"];

const editSchema = z.object({
  titulo: z.string().trim().min(1).max(180).optional(),
  descricao: z.string().max(500000).optional(),
  prioridade: z
    .string()
    .refine(prioridadeValida, "Prioridade inválida.")
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const item = await prisma.backlogItem.findUnique({ where: { id } });
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const acao = body.acao as BacklogAcao | undefined;

  // --- Transicao de status ---
  if (acao && ACOES.includes(acao)) {
    const agora = new Date();
    const data: Prisma.BacklogItemUpdateInput = {};
    if (acao === "iniciar") {
      data.status = "em_andamento";
      data.iniciadoEm = agora;
      data.iniciadoPorNome = admin.nome;
      data.concluidoEm = null;
      data.concluidoPorNome = null;
      data.canceladoEm = null;
      data.canceladoPorNome = null;
    } else if (acao === "concluir") {
      data.status = "concluido";
      data.concluidoEm = agora;
      data.concluidoPorNome = admin.nome;
    } else if (acao === "cancelar") {
      data.status = "cancelado";
      data.canceladoEm = agora;
      data.canceladoPorNome = admin.nome;
    } else if (acao === "reabrir") {
      data.status = "aberto";
      data.concluidoEm = null;
      data.concluidoPorNome = null;
      data.canceladoEm = null;
      data.canceladoPorNome = null;
    }

    await prisma.backlogItem.update({ where: { id }, data });
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: `backlog.${acao}`,
      detalhe: `Item "${item.titulo}"`,
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });
    return NextResponse.json({ ok: true });
  }

  // --- Edicao dos campos ---
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { titulo, descricao, prioridade } = parsed.data;
  if (titulo === undefined && descricao === undefined && prioridade === undefined) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await prisma.backlogItem.update({
    where: { id },
    data: {
      ...(titulo !== undefined ? { titulo } : {}),
      ...(descricao !== undefined ? { descricao } : {}),
      ...(prioridade !== undefined ? { prioridade } : {}),
    },
  });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "backlog.editar",
    detalhe: `Item "${titulo ?? item.titulo}"`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const item = await prisma.backlogItem.findUnique({
    where: { id },
    select: { titulo: true },
  });
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  }

  await prisma.backlogItem.delete({ where: { id } });
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "backlog.excluir",
    detalhe: `Item "${item.titulo}"`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return NextResponse.json({ ok: true });
}
