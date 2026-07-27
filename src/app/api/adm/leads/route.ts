import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";

// Acoes do painel sobre os leads do +HCE: salvar observacoes e excluir.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  let body: { id?: string; observacoes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id ausente" }, { status: 400 });
  }
  const obs = (body.observacoes ?? "").trim().slice(0, 2000) || null;
  await prisma.clubeLead.update({
    where: { id: body.id },
    data: { observacoes: obs },
  });
  return NextResponse.json({ ok: true, observacoes: obs });
}

export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "id ausente" }, { status: 400 });
  }
  await prisma.clubeLead.delete({ where: { id: body.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
