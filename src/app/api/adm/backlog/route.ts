import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import { prioridadeValida } from "@/lib/backlog";

// Criacao de item de backlog interno. Protegido pelo login do /adm.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  titulo: z.string().trim().min(1, "Dê um nome ao item.").max(180),
  // HTML do editor (permite imagens coladas embutidas). Cap generoso.
  descricao: z.string().max(500000).optional().default(""),
  prioridade: z.string().refine(prioridadeValida, "Prioridade inválida."),
});

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { titulo, descricao, prioridade } = parsed.data;

  const item = await prisma.backlogItem.create({
    data: {
      titulo,
      descricao,
      prioridade,
      status: "aberto",
      criadoPorLogin: admin.login,
      criadoPorNome: admin.nome,
    },
    select: { id: true },
  });

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "backlog.criar",
    detalhe: `Item "${titulo}" (${prioridade})`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true, id: item.id });
}
