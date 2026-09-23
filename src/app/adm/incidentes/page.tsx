import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import {
  IncidentesPainel,
  type IncidenteRow,
} from "@/components/adm/incidentes-painel";
import { codigoIncidente, dataParaInput } from "@/lib/incidentes";

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

const fmtData = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

export default async function AdmIncidentesPage() {
  await requireAdmin();

  const rows = await prisma.incidente.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Código sequencial estável (INC_001...) pela ordem de criação.
  const linhas: IncidenteRow[] = rows.map((r, i) => ({
    id: r.id,
    codigo: codigoIncidente(i + 1),
    titulo: r.titulo,
    detalhamento: r.detalhamento,
    severidade: r.severidade,
    status: r.status,
    abertoPorNome: r.abertoPorNome,
    abertoDataFmt: fmtData.format(r.abertoEm),
    abertoInput: dataParaInput(r.abertoEm),
    abertoTs: r.abertoEm.getTime(),
    emAndamentoFmt: r.emAndamentoEm ? fmt.format(r.emAndamentoEm) : null,
    emAndamentoPorNome: r.emAndamentoPorNome,
    resolvidoFmt: r.resolvidoEm ? fmt.format(r.resolvidoEm) : null,
    resolvidoPorNome: r.resolvidoPorNome,
    canceladoFmt: r.canceladoEm ? fmt.format(r.canceladoEm) : null,
    canceladoPorNome: r.canceladoPorNome,
    criadoFmt: fmt.format(r.createdAt),
  }));

  const abertos = linhas.filter((l) => l.status === "aberto").length;
  const andamento = linhas.filter((l) => l.status === "em_andamento").length;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-blue">
            Gestão de Incidentes
          </h1>
          <p className="mt-1 text-sm text-muted">
            {linhas.length} incidente(s) · {abertos} aberto(s) · {andamento} em
            andamento. Qualquer admin pode abrir um registro; o código
            (INC_001…) é gerado automaticamente.
          </p>
        </div>
        <IncidentesPainel itens={linhas} />
      </div>
    </main>
  );
}
