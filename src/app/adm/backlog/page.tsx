import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { BacklogPainel, type BacklogRow } from "@/components/adm/backlog-painel";
import {
  codigoBacklog,
  prazoParaBR,
  prazoParaInput,
  alertaPrazo,
} from "@/lib/backlog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function temConteudo(html: string): boolean {
  // Considera vazio se não sobra texto nem imagem depois de limpar tags.
  if (/<img\b/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
}

export default async function AdmBacklogPage() {
  await requireAdmin();

  const rows = await prisma.backlogItem.findMany({
    orderBy: { createdAt: "asc" },
  });

  const agora = new Date();

  // Código sequencial estável (BAC_001...) pela ordem de criação.
  const linhas: BacklogRow[] = rows.map((r, i) => {
    const alerta = alertaPrazo(r.prazo, r.status, agora);
    return {
    id: r.id,
    codigo: codigoBacklog(i + 1),
    titulo: r.titulo,
    descricaoHtml: r.descricao,
    temDescricao: temConteudo(r.descricao),
    prioridade: r.prioridade,
    status: r.status,
    prazoFmt: r.prazo ? prazoParaBR(r.prazo) : null,
    prazoInput: r.prazo ? prazoParaInput(r.prazo) : null,
    prazoTs: r.prazo ? r.prazo.getTime() : null,
    prazoAlerta: alerta.tipo,
    prazoDias: alerta.dias,
    criadoPorNome: r.criadoPorNome,
    criadoFmt: fmt.format(r.createdAt),
    criadoTs: r.createdAt.getTime(),
    iniciadoPorNome: r.iniciadoPorNome,
    iniciadoFmt: r.iniciadoEm ? fmt.format(r.iniciadoEm) : null,
    iniciadoTs: r.iniciadoEm ? r.iniciadoEm.getTime() : null,
    concluidoPorNome: r.concluidoPorNome,
    concluidoFmt: r.concluidoEm ? fmt.format(r.concluidoEm) : null,
    canceladoPorNome: r.canceladoPorNome,
    canceladoFmt: r.canceladoEm ? fmt.format(r.canceladoEm) : null,
    };
  });

  const abertos = linhas.filter((l) => l.status === "aberto").length;
  const andamento = linhas.filter((l) => l.status === "em_andamento").length;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-blue">
            Backlog do time
          </h1>
          <p className="mt-1 text-sm text-muted">
            {linhas.length} item(ns) · {abertos} aberto(s) · {andamento} em
            andamento. Qualquer admin pode registrar itens; o código
            (BAC_001…) é gerado automaticamente.
          </p>
        </div>
        <BacklogPainel itens={linhas} />
      </div>
    </main>
  );
}
