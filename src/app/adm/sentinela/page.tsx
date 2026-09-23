import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import {
  SentinelaPainel,
  type SentinelaCheckRow,
} from "@/components/adm/sentinela-painel";
import { NEON_PLANO, type CheckItem } from "@/lib/sentinela";

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

function parseItens(detalhe: string): CheckItem[] {
  try {
    const v = JSON.parse(detalhe);
    return Array.isArray(v) ? (v as CheckItem[]) : [];
  } catch {
    return [];
  }
}

export default async function AdmSentinelaPage() {
  await requireAdmin();

  const checks = await prisma.sentinelaCheck.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const linhas: SentinelaCheckRow[] = checks.map((c) => ({
    id: c.id,
    origem: c.origem,
    ok: c.ok,
    dbOk: c.dbOk,
    dbLatenciaMs: c.dbLatenciaMs,
    dbSizeBytes: c.dbSizeBytes != null ? Number(c.dbSizeBytes) : null,
    naMidiaOk: c.naMidiaOk,
    naMidiaStatus: c.naMidiaStatus,
    midiaCount: c.midiaCount,
    neonOk: c.neonOk,
    neonComputeSeconds: c.neonComputeSeconds,
    neonStorageBytes:
      c.neonStorageBytes != null ? Number(c.neonStorageBytes) : null,
    neonPeriodEndFmt: c.neonPeriodEnd ? fmt.format(c.neonPeriodEnd) : null,
    quandoFmt: fmt.format(c.createdAt),
    quandoTs: c.createdAt.getTime(),
    itens: parseItens(c.detalhe),
  }));

  const ultima = linhas[0] ?? null;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-brand-blue">
            Sentinela <span aria-hidden>🛡️</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monitoramento ativo da saúde do site. Roda 2x/dia (cron externo) e a
            qualquer momento pelo botão abaixo. Abre incidentes automaticamente
            e os resolve sozinho quando tudo volta ao normal.
          </p>
        </div>

        <SentinelaPainel
          ultima={ultima}
          historico={linhas}
          config={{
            secretConfigurado: !!process.env.SENTINELA_SECRET,
            neonConfigurado: !!process.env.NEON_API_KEY,
            appUrl:
              process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
              "https://hcegastronomia.com",
            planoNome: NEON_PLANO.nome,
            storageIncluidoBytes: NEON_PLANO.storageIncluidoBytes,
            computeIncluidoHoras: NEON_PLANO.computeIncluidoHoras,
          }}
        />
      </div>
    </main>
  );
}
