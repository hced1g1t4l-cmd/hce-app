import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { AdmHeader } from "@/components/adm/adm-header";
import { AcessosChart } from "@/components/adm/acessos-chart";
import { AcessosMapa } from "@/components/adm/acessos-mapa";
import {
  PERIODOS,
  getCidades,
  getSerie,
  getTotais,
  parsePeriodo,
} from "@/lib/analytics";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const nf = new Intl.NumberFormat("pt-BR");

export default async function AdmAcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  if (!(await isAuthed())) redirect("/adm/login");

  const { periodo: periodoRaw } = await searchParams;
  const periodo = parsePeriodo(periodoRaw);

  const [serie, totais, cidades] = await Promise.all([
    getSerie(periodo),
    getTotais(periodo),
    getCidades(periodo),
  ]);

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="acessos" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-brand-blue">
              Acessos ao site
            </h1>
            <p className="text-sm text-muted">
              Usuários únicos, acessos totais e origem por cidade.
            </p>
          </div>

          <nav
            aria-label="Filtro de período"
            className="flex flex-wrap gap-2"
          >
            {PERIODOS.map((p) => (
              <Link
                key={p.id}
                href={
                  p.id === "total"
                    ? "/adm/acessos"
                    : `/adm/acessos?periodo=${p.id}`
                }
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  periodo === p.id
                    ? "border-brand-blue bg-brand-blue text-white"
                    : "border-line bg-white text-brand-blue hover:bg-surface-soft",
                )}
              >
                {p.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <Kpi
            label="Acessos totais"
            valor={nf.format(totais.total)}
            cor="azul"
          />
          <Kpi
            label="Usuários únicos"
            valor={nf.format(totais.unicos)}
            cor="ambar"
          />
        </div>

        <section className="mb-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-4 font-display text-base font-bold text-brand-blue">
            Evolução dos acessos
          </h2>
          <AcessosChart data={serie} />
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 lg:col-span-3">
            <h2 className="mb-4 font-display text-base font-bold text-brand-blue">
              Distribuição por cidade
            </h2>
            <AcessosMapa cidades={cidades} />
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 lg:col-span-2">
            <h2 className="mb-4 font-display text-base font-bold text-brand-blue">
              Principais cidades
            </h2>
            {cidades.length === 0 ? (
              <p className="text-sm text-muted">
                Nenhuma cidade registrada neste período ainda.
              </p>
            ) : (
              <ol className="space-y-1">
                {cidades.slice(0, 12).map((c, i) => (
                  <li
                    key={c.city}
                    className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm odd:bg-surface-soft"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="w-5 shrink-0 text-right text-xs font-semibold text-muted">
                        {i + 1}
                      </span>
                      <span className="truncate font-medium text-ink">
                        {c.city}
                        {c.country && c.country !== "BR" ? (
                          <span className="text-muted"> · {c.country}</span>
                        ) : null}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="font-semibold text-brand-blue">
                        {nf.format(c.total)}
                      </span>
                      <span className="text-muted"> / {nf.format(c.unicos)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-3 text-xs text-muted">
              Total de acessos / usuários únicos.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpi({
  label,
  valor,
  cor,
}: {
  label: string;
  valor: string;
  cor: "azul" | "ambar";
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "inline-block h-2.5 w-2.5 rounded-full",
            cor === "azul" ? "bg-brand-blue" : "bg-brand-amber",
          )}
        />
        <span className="text-sm font-medium text-muted">{label}</span>
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-brand-blue">
        {valor}
      </p>
    </div>
  );
}
