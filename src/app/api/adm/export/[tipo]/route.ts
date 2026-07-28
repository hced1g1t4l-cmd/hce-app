import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { toCSV, toPDF, toXLS, type Planilha } from "@/lib/export";
import { capitalizarNome } from "@/lib/nome";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

async function montarLeads(): Promise<Planilha> {
  const leads = await prisma.clubeLead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return {
    titulo: "Leads · +HCE",
    colunas: [
      { titulo: "Data/Hora", largura: 12 },
      { titulo: "Nome", largura: 16 },
      { titulo: "E-mail", largura: 20 },
      { titulo: "Telefone", largura: 12 },
      { titulo: "Meio (aviso)", largura: 12 },
      { titulo: "Promoções", largura: 8 },
      { titulo: "Observações", largura: 20 },
      { titulo: "IP", largura: 10 },
    ],
    linhas: leads.map((l) => [
      fmtDataHora.format(l.createdAt),
      capitalizarNome(l.nome),
      l.email,
      l.telefone,
      [l.canalEmail && "E-mail", l.canalSms && "SMS", l.canalWhatsapp && "WhatsApp"]
        .filter(Boolean)
        .join(", "),
      l.aceitaPromos ? "Sim" : "Não",
      l.observacoes ?? "",
      l.ip ?? "",
    ]),
  };
}

async function montarContatos(): Promise<Planilha> {
  const msgs = await prisma.contatoMensagem.findMany({
    orderBy: { createdAt: "desc" },
  });
  return {
    titulo: "Mensagens · Fale com a HCE",
    colunas: [
      { titulo: "Data/Hora", largura: 12 },
      { titulo: "Nome", largura: 16 },
      { titulo: "E-mail", largura: 18 },
      { titulo: "Telefone", largura: 11 },
      { titulo: "Mensagem", largura: 26 },
      { titulo: "Permissões", largura: 10 },
      { titulo: "Observações", largura: 18 },
      { titulo: "IP", largura: 9 },
    ],
    linhas: msgs.map((m) => [
      fmtDataHora.format(m.createdAt),
      capitalizarNome(m.nome),
      m.email,
      m.telefone ?? "",
      m.mensagem,
      [
        m.permiteEmail && "E-mail",
        m.permiteTelefone && "Telefone",
        m.permiteWhatsapp && "WhatsApp",
      ]
        .filter(Boolean)
        .join(", "),
      m.observacoes ?? "",
      m.ip ?? "",
    ]),
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tipo: string }> },
) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { tipo } = await params;
  const fmt = new URL(req.url).searchParams.get("fmt") || "csv";

  const planilha =
    tipo === "leads"
      ? await montarLeads()
      : tipo === "contatos"
        ? await montarContatos()
        : null;

  if (!planilha) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const hoje = new Date().toISOString().slice(0, 10);
  const dataGeracao = fmtDataHora.format(new Date());
  const base = `hce-${tipo}-${hoje}`;

  if (fmt === "csv") {
    const buf = toCSV(planilha);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.csv"`,
      },
    });
  }

  if (fmt === "xls") {
    const buf = toXLS(planilha, dataGeracao);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="${base}.xls"`,
      },
    });
  }

  if (fmt === "pdf") {
    const buf = await toPDF(planilha, dataGeracao);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${base}.pdf"`,
      },
    });
  }

  return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
}
