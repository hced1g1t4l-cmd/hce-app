"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { baixarCSV, baixarXLS } from "@/lib/export-cliente";

export type KpisFeed = {
  acessosIndice: number;
  acessosArtigos: number;
  acessosTotal: number;
  leitoresUnicos: number;
  tempoMedioArtigoFmt: string;
};

export type ArtigoMetrica = {
  id: string;
  titulo: string;
  slug: string;
  acessos: number;
  leitores: number;
  tempoMedioMs: number;
  tempoMedioFmt: string;
  ultimoFmt: string;
};

export type PerfilMetrica = {
  id: string;
  nome: string;
  handle: string | null;
  email: string;
  plano: string;
  acessos: number;
  tempoTotalMs: number;
  tempoTotalFmt: string;
  ultimoFmt: string;
};

const PERIODOS: { id: string; label: string }[] = [
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "90", label: "90 dias" },
  { id: "tudo", label: "Tudo" },
];

function carimbo(): string {
  return new Date()
    .toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    .replace(",", "");
}

function Kpi({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-brand-blue">
        {valor}
      </p>
    </div>
  );
}

export function MetricasFeed({
  kpis,
  artigos,
  perfis,
  periodo,
}: {
  kpis: KpisFeed;
  artigos: ArtigoMetrica[];
  perfis: PerfilMetrica[];
  periodo: string;
}) {
  const [buscaArt, setBuscaArt] = useState("");
  const [buscaPerf, setBuscaPerf] = useState("");

  const listaArt = useMemo(() => {
    const q = buscaArt.trim().toLowerCase();
    if (!q) return artigos;
    return artigos.filter((a) => a.titulo.toLowerCase().includes(q));
  }, [artigos, buscaArt]);

  const listaPerf = useMemo(() => {
    const q = buscaPerf.trim().toLowerCase();
    if (!q) return perfis;
    return perfis.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        (p.handle ?? "").toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.plano.toLowerCase().includes(q),
    );
  }, [perfis, buscaPerf]);

  function exportarArtigos(tipo: "csv" | "xls") {
    const colunas = [
      "Artigo",
      "Acessos",
      "Leitores únicos",
      "Tempo médio",
      "Último acesso",
    ];
    const linhas = listaArt.map((a) => [
      a.titulo,
      String(a.acessos),
      String(a.leitores),
      a.tempoMedioFmt,
      a.ultimoFmt,
    ]);
    const nome = `metricas-feed-artigos-${periodo}`;
    if (tipo === "csv") baixarCSV(`${nome}.csv`, colunas, linhas);
    else baixarXLS(`${nome}.xls`, "Feed — artigos", colunas, linhas, carimbo());
  }

  function exportarPerfis(tipo: "csv" | "xls") {
    const colunas = [
      "Perfil",
      "@",
      "E-mail",
      "Plano",
      "Acessos",
      "Tempo total",
      "Último acesso",
    ];
    const linhas = listaPerf.map((p) => [
      p.nome,
      p.handle ?? "",
      p.email,
      p.plano,
      String(p.acessos),
      p.tempoTotalFmt,
      p.ultimoFmt,
    ]);
    const nome = `metricas-feed-perfis-${periodo}`;
    if (tipo === "csv") baixarCSV(`${nome}.csv`, colunas, linhas);
    else baixarXLS(`${nome}.xls`, "Feed — perfis", colunas, linhas, carimbo());
  }

  return (
    <div className="space-y-8">
      {/* PERÍODO */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-muted">Período:</span>
        {PERIODOS.map((p) => (
          <Link
            key={p.id}
            href={`/adm/metricas?periodo=${p.id}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              periodo === p.id
                ? "bg-brand-blue text-white"
                : "border border-line bg-white text-ink hover:bg-surface-soft"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Acessos ao Feed" valor={kpis.acessosTotal} />
        <Kpi label="Índice /feed" valor={kpis.acessosIndice} />
        <Kpi label="Acessos a artigos" valor={kpis.acessosArtigos} />
        <Kpi label="Leitores únicos" valor={kpis.leitoresUnicos} />
        <Kpi label="Tempo médio/artigo" valor={kpis.tempoMedioArtigoFmt} />
      </div>

      {/* ARTIGOS */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-bold text-brand-blue">
            Por artigo{" "}
            <span className="text-sm font-normal text-muted">
              ({listaArt.length})
            </span>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={buscaArt}
              onChange={(e) => setBuscaArt(e.target.value)}
              type="search"
              placeholder="Buscar artigo…"
              className="hce-input max-w-xs"
            />
            <button
              type="button"
              onClick={() => exportarArtigos("csv")}
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportarArtigos("xls")}
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                <th className="px-4 py-3 font-semibold">Artigo</th>
                <th className="px-4 py-3 text-right font-semibold">Acessos</th>
                <th className="px-4 py-3 text-right font-semibold">Leitores</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Tempo médio
                </th>
                <th className="px-4 py-3 font-semibold">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {listaArt.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Sem acessos no período.
                  </td>
                </tr>
              ) : (
                listaArt.map((a) => (
                  <tr key={a.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3">
                      {a.slug ? (
                        <a
                          href={`/feed/${a.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-brand-blue hover:underline"
                        >
                          {a.titulo}
                        </a>
                      ) : (
                        <span className="font-semibold text-ink">{a.titulo}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {a.acessos}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {a.leitores}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {a.tempoMedioFmt}
                    </td>
                    <td className="px-4 py-3 text-muted">{a.ultimoFmt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PERFIS */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-lg font-bold text-brand-blue">
            Perfis que acessaram{" "}
            <span className="text-sm font-normal text-muted">
              ({listaPerf.length})
            </span>
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <input
              value={buscaPerf}
              onChange={(e) => setBuscaPerf(e.target.value)}
              type="search"
              placeholder="Buscar por nome, @, e-mail…"
              className="hce-input max-w-xs"
            />
            <button
              type="button"
              onClick={() => exportarPerfis("csv")}
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => exportarPerfis("xls")}
              className="rounded-full border border-line bg-white px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs tracking-wide text-muted uppercase">
                <th className="px-4 py-3 font-semibold">Perfil</th>
                <th className="px-4 py-3 font-semibold">Plano</th>
                <th className="px-4 py-3 text-right font-semibold">Acessos</th>
                <th className="px-4 py-3 text-right font-semibold">
                  Tempo total
                </th>
                <th className="px-4 py-3 font-semibold">Último acesso</th>
              </tr>
            </thead>
            <tbody>
              {listaPerf.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    Sem acessos no período.
                  </td>
                </tr>
              ) : (
                listaPerf.map((p) => (
                  <tr key={p.id} className="border-b border-line/70 last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-ink">{p.nome}</span>
                      {p.handle && (
                        <span className="ml-1.5 text-brand-blue">
                          @{p.handle}
                        </span>
                      )}
                      <span className="block text-xs text-muted">{p.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue capitalize">
                        {p.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink">
                      {p.acessos}
                    </td>
                    <td className="px-4 py-3 text-right text-ink">
                      {p.tempoTotalFmt}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.ultimoFmt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
