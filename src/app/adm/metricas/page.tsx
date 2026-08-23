import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import {
  MetricasFeed,
  type ArtigoMetrica,
  type PerfilMetrica,
  type KpisFeed,
} from "@/components/adm/metricas-feed";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function fmtDuracao(ms: number | null | undefined): string {
  if (!ms || ms < 1000) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return `${m}m ${rs}s`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

const PERIODOS: Record<string, number | null> = {
  "7": 7,
  "30": 30,
  "90": 90,
  tudo: null,
};

export default async function AdmMetricasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  await requireAdmin();

  const sp = await searchParams;
  const periodo =
    sp.periodo && sp.periodo in PERIODOS ? sp.periodo : "30";
  const dias = PERIODOS[periodo];
  const desde = dias == null ? undefined : new Date(Date.now() - dias * 86400000);
  const whereBase = desde ? { createdAt: { gte: desde } } : {};

  const [
    acessosIndice,
    acessosArtigos,
    porUsuarioTotal,
    mediaArtigo,
    porArtigo,
    porArtigoUsuario,
    porPerfil,
  ] = await Promise.all([
    prisma.feedAcesso.count({ where: { ...whereBase, artigoId: null } }),
    prisma.feedAcesso.count({ where: { ...whereBase, artigoId: { not: null } } }),
    prisma.feedAcesso.groupBy({ by: ["userId"], where: whereBase }),
    prisma.feedAcesso.aggregate({
      where: { ...whereBase, artigoId: { not: null }, durationMs: { not: null } },
      _avg: { durationMs: true },
    }),
    prisma.feedAcesso.groupBy({
      by: ["artigoId"],
      where: { ...whereBase, artigoId: { not: null } },
      _count: { _all: true },
      _avg: { durationMs: true },
      _max: { createdAt: true },
    }),
    prisma.feedAcesso.groupBy({
      by: ["artigoId", "userId"],
      where: { ...whereBase, artigoId: { not: null } },
    }),
    prisma.feedAcesso.groupBy({
      by: ["userId"],
      where: whereBase,
      _count: { _all: true },
      _sum: { durationMs: true },
      _max: { createdAt: true },
    }),
  ]);

  // Leitores únicos por artigo.
  const leitoresPorArtigo = new Map<string, number>();
  for (const r of porArtigoUsuario) {
    if (!r.artigoId) continue;
    leitoresPorArtigo.set(r.artigoId, (leitoresPorArtigo.get(r.artigoId) ?? 0) + 1);
  }

  // Títulos dos artigos acessados.
  const artigoIds = porArtigo
    .map((r) => r.artigoId)
    .filter((x): x is string => x != null);
  const artigos = await prisma.artigo.findMany({
    where: { id: { in: artigoIds } },
    select: { id: true, titulo: true, slug: true },
  });
  const artigoMap = new Map(artigos.map((a) => [a.id, a]));

  const linhasArtigos: ArtigoMetrica[] = porArtigo
    .map((r) => {
      const a = r.artigoId ? artigoMap.get(r.artigoId) : undefined;
      return {
        id: r.artigoId ?? "",
        titulo: a?.titulo ?? "(artigo removido)",
        slug: a?.slug ?? "",
        acessos: r._count._all,
        leitores: r.artigoId ? (leitoresPorArtigo.get(r.artigoId) ?? 0) : 0,
        tempoMedioMs: Math.round(r._avg.durationMs ?? 0),
        tempoMedioFmt: fmtDuracao(r._avg.durationMs),
        ultimoFmt: r._max.createdAt ? fmtDataHora.format(r._max.createdAt) : "—",
      };
    })
    .sort((a, b) => b.acessos - a.acessos);

  // Perfis (usuários) que acessaram.
  const userIds = porPerfil.map((r) => r.userId);
  const usuarios = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true, handle: true, plano: true },
  });
  const userMap = new Map(usuarios.map((u) => [u.id, u]));

  const linhasPerfis: PerfilMetrica[] = porPerfil
    .map((r) => {
      const u = userMap.get(r.userId);
      return {
        id: r.userId,
        nome: u?.name ?? "Membro HCE",
        handle: u?.handle ?? null,
        email: u?.email ?? "—",
        plano: u?.plano ?? "free",
        acessos: r._count._all,
        tempoTotalMs: Math.round(r._sum.durationMs ?? 0),
        tempoTotalFmt: fmtDuracao(r._sum.durationMs),
        ultimoFmt: r._max.createdAt ? fmtDataHora.format(r._max.createdAt) : "—",
      };
    })
    .sort((a, b) => b.acessos - a.acessos);

  const kpis: KpisFeed = {
    acessosIndice,
    acessosArtigos,
    acessosTotal: acessosIndice + acessosArtigos,
    leitoresUnicos: porUsuarioTotal.length,
    tempoMedioArtigoFmt: fmtDuracao(mediaArtigo._avg.durationMs),
  };

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Métricas do Feed HCE
          </h1>
          <p className="text-sm text-muted">
            Acessos ao Feed, leitura por artigo, perfis que acessaram e tempo de
            permanência.
          </p>
        </div>

        <MetricasFeed
          kpis={kpis}
          artigos={linhasArtigos}
          perfis={linhasPerfis}
          periodo={periodo}
        />
      </div>
    </main>
  );
}
