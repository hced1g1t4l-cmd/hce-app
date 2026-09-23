import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";
import {
  severidadeValida,
  dataAberturaDoInput,
  codigoIncidente,
} from "@/lib/incidentes";

// Abertura de incidente pelo painel /adm/incidentes. Protegido pelo login.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dataSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")
  .optional()
  .nullable()
  .or(z.literal(""));

const schema = z.object({
  titulo: z.string().trim().min(1, "Dê um título ao incidente.").max(180),
  detalhamento: z.string().max(20000).optional().default(""),
  severidade: z.string().refine(severidadeValida, "Severidade inválida."),
  // Abre já "em andamento" quando marcado (senão, entra como "aberto").
  emAndamento: z.boolean().optional().default(false),
  dataAbertura: dataSchema,
});

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

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { titulo, detalhamento, severidade, emAndamento, dataAbertura } =
    parsed.data;

  const agora = new Date();
  const abertoEm = dataAberturaDoInput(dataAbertura) ?? agora;

  const item = await prisma.incidente.create({
    data: {
      titulo,
      detalhamento,
      severidade,
      status: emAndamento ? "em_andamento" : "aberto",
      abertoPorNome: admin.nome,
      abertoEm,
      ...(emAndamento
        ? { emAndamentoEm: agora, emAndamentoPorNome: admin.nome }
        : {}),
    },
    select: { id: true },
  });

  // Numero sequencial só para o log (a UI recalcula pela ordem de criação).
  const total = await prisma.incidente.count();

  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "incidente.abrir",
    detalhe: `${codigoIncidente(total)} "${titulo}" (${severidade})`,
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ ok: true, id: item.id });
}
