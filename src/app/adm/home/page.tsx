import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { PLANOS, PLANO_LABEL, type Plano } from "@/lib/planos";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const nf = new Intl.NumberFormat("pt-BR");
const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

// Config visual de cada plano (topo -> base da pirâmide).
const NIVEIS: {
  plano: Plano;
  barra: string;
  texto: string;
  ponto: string;
}[] = [
  { plano: "premium", barra: "bg-brand-amber", texto: "text-brand-blue-deep", ponto: "bg-brand-amber" },
  { plano: "profissional", barra: "bg-brand-blue", texto: "text-white", ponto: "bg-brand-blue" },
  { plano: "essencial", barra: "bg-emerald-500", texto: "text-white", ponto: "bg-emerald-500" },
  { plano: "free", barra: "bg-slate-400", texto: "text-white", ponto: "bg-slate-400" },
];

export default async function AdmHomePage() {
  const sessaoAdm = await getAdmin();
  if (!sessaoAdm) redirect("/adm/login");
  if (sessaoAdm.precisaTrocarSenha) redirect("/adm/trocar-senha");

  const desdeSemana = new Date(Date.now() - SEMANA_MS);

  const [total, ativosSemana, porPlano] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { ultimoAcesso: { gte: desdeSemana } } }),
    prisma.user.groupBy({ by: ["plano"], _count: { _all: true } }),
  ]);

  // Contagem por plano (com fallback p/ valores fora da lista conhecida).
  const contagem = new Map<string, number>();
  for (const r of porPlano) contagem.set(r.plano, r._count._all);
  const conhecidos = PLANOS.reduce(
    (s, p) => s + (contagem.get(p) ?? 0),
    0,
  );
  const outros = total - conhecidos;

  const niveis = NIVEIS.map((n) => ({
    ...n,
    qtd: contagem.get(n.plano) ?? 0,
    label: PLANO_LABEL[n.plano],
  }));
  const maxQtd = Math.max(1, ...niveis.map((n) => n.qtd));

  const pctAtivos = total > 0 ? Math.round((ativosSemana / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Início · Visão geral
          </h1>
          <p className="text-sm text-muted">
            Principais indicadores das contas do site.
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full bg-brand-blue"
              />
              <span className="text-sm font-medium text-muted">
                Usuários cadastrados
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand-blue">
              {nf.format(total)}
            </p>
            <p className="mt-1 text-xs text-muted">
              Total de contas criadas no site.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full bg-brand-amber"
              />
              <span className="text-sm font-medium text-muted">
                Ativos na última semana
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold text-brand-blue">
              {nf.format(ativosSemana)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {pctAtivos}% do total · navegaram logados nos últimos 7 dias.
            </p>
          </div>
        </div>

        {/* PIRÂMIDE DE PLANOS */}
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-1 font-display text-base font-bold text-brand-blue">
            Distribuição por plano
          </h2>
          <p className="mb-5 text-sm text-muted">
            Quantidade de contas em cada plano do +HCE.
          </p>

          {total === 0 ? (
            <p className="rounded-xl border border-line bg-surface-soft p-6 text-center text-sm text-muted">
              Nenhuma conta criada ainda.
            </p>
          ) : (
            <>
              {/* pirâmide: topo (premium) -> base (gratuito) */}
              <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
                {niveis.map((n) => {
                  const largura = Math.max(18, Math.round((n.qtd / maxQtd) * 100));
                  const pct =
                    total > 0 ? Math.round((n.qtd / total) * 100) : 0;
                  return (
                    <div
                      key={n.plano}
                      className={cn(
                        "flex h-12 items-center justify-center gap-2 rounded-lg px-3 shadow-sm",
                        n.barra,
                        n.texto,
                      )}
                      style={{ width: `${largura}%` }}
                      title={`${n.label}: ${nf.format(n.qtd)} (${pct}%)`}
                    >
                      <span className="truncate text-sm font-bold">
                        {n.label}
                      </span>
                      <span className="text-sm font-semibold opacity-90">
                        · {nf.format(n.qtd)}
                      </span>
                      <span className="hidden text-xs opacity-80 sm:inline">
                        ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* legenda com números exatos */}
              <ul className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
                {niveis.map((n) => {
                  const pct =
                    total > 0 ? Math.round((n.qtd / total) * 100) : 0;
                  return (
                    <li
                      key={n.plano}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm odd:bg-surface-soft sm:justify-start"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className={cn(
                            "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
                            n.ponto,
                          )}
                        />
                        <span className="font-medium text-ink">{n.label}</span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap">
                        <span className="font-semibold text-brand-blue">
                          {nf.format(n.qtd)}
                        </span>
                        <span className="text-muted"> · {pct}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              {outros > 0 && (
                <p className="mt-4 text-center text-xs text-muted">
                  + {nf.format(outros)} em outros planos não catalogados.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
