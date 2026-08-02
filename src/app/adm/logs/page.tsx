import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import { LogsTabela, type LogRow } from "@/components/adm/logs-tabela";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// Data no formato yyyy-mm-dd (fuso de São Paulo) para o filtro por período.
const fmtDia = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export default async function AdmLogsPage() {
  await requireAdmin();

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const linhas: LogRow[] = logs.map((l) => ({
    id: l.id,
    quando: fmt.format(l.createdAt),
    dia: fmtDia.format(l.createdAt),
    adminLogin: l.adminLogin,
    acao: l.acao,
    detalhe: l.detalhe,
    ip: l.ip,
  }));

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="logs" />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Logs de auditoria
          </h1>
          <p className="text-sm text-muted">
            Últimos {logs.length} registros de tudo o que foi feito no painel.
          </p>
        </div>
        <LogsTabela logs={linhas} />
      </div>
    </main>
  );
}
