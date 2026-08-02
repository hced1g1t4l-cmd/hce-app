"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArtigoAcoes } from "./artigo-acoes";
import { REACOES, type ContagemReacoes } from "@/lib/reacoes";

export type ArtigoRow = {
  id: string;
  codigo: string;
  num: number;
  titulo: string;
  slug: string;
  autor: string;
  capaUrl: string | null;
  publicado: boolean;
  status: string;
  reacoes: ContagemReacoes;
  reacoesTotal: number;
  comentariosAprovados: number;
  comentariosPendentes: number;
  criadoTs: number;
  criadoFmt: string;
  atualizadoTs: number;
  atualizadoFmt: string;
};

type ColKey =
  | "codigo"
  | "titulo"
  | "status"
  | "reacoes"
  | "comentarios"
  | "autor"
  | "criado"
  | "atualizado";

const COLUNAS: {
  key: ColKey;
  label: string;
  tipo: "texto" | "status" | "custom";
}[] = [
  { key: "codigo", label: "ID", tipo: "texto" },
  { key: "titulo", label: "Título", tipo: "texto" },
  { key: "status", label: "Status", tipo: "status" },
  { key: "reacoes", label: "Reações", tipo: "custom" },
  { key: "comentarios", label: "Comentários", tipo: "custom" },
  { key: "autor", label: "Autor", tipo: "texto" },
  { key: "criado", label: "Criado em", tipo: "texto" },
  { key: "atualizado", label: "Atualizado", tipo: "texto" },
];

function valorPara(a: ArtigoRow, key: ColKey): string {
  switch (key) {
    case "codigo":
      return a.codigo;
    case "titulo":
      return a.titulo;
    case "status":
      return a.status;
    case "reacoes":
      return String(a.reacoesTotal);
    case "comentarios":
      return String(a.comentariosAprovados + a.comentariosPendentes);
    case "autor":
      return a.autor;
    case "criado":
      return a.criadoFmt;
    case "atualizado":
      return a.atualizadoFmt;
  }
}

function ordenavelPara(a: ArtigoRow, key: ColKey): number | string {
  switch (key) {
    case "codigo":
      return a.num;
    case "reacoes":
      return a.reacoesTotal;
    case "comentarios":
      return a.comentariosAprovados + a.comentariosPendentes;
    case "criado":
      return a.criadoTs;
    case "atualizado":
      return a.atualizadoTs;
    default:
      return valorPara(a, key).toLocaleLowerCase("pt-BR");
  }
}

export function ArtigosTabela({ artigos }: { artigos: ArtigoRow[] }) {
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  const [ordem, setOrdem] = useState<{ col: ColKey; dir: 1 | -1 } | null>(null);

  function clicarColuna(col: ColKey) {
    setOrdem((o) => {
      if (!o || o.col !== col) return { col, dir: 1 };
      if (o.dir === 1) return { col, dir: -1 };
      return null; // terceiro clique volta à ordem natural
    });
  }

  function setFiltro(key: string, v: string) {
    setFiltros((f) => ({ ...f, [key]: v }));
  }

  const linhas = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase("pt-BR");

    let out = artigos.filter((a) => {
      // Busca global em todas as colunas visíveis.
      if (q) {
        const alvo = COLUNAS.map((c) => valorPara(a, c.key))
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        if (!alvo.includes(q)) return false;
      }
      // Filtros por coluna.
      for (const c of COLUNAS) {
        const f = (filtros[c.key] ?? "").trim();
        if (!f) continue;
        if (c.tipo === "status") {
          if (a.status !== f) return false;
        } else {
          const v = valorPara(a, c.key).toLocaleLowerCase("pt-BR");
          if (!v.includes(f.toLocaleLowerCase("pt-BR"))) return false;
        }
      }
      return true;
    });

    if (ordem) {
      out = [...out].sort((a, b) => {
        const va = ordenavelPara(a, ordem.col);
        const vb = ordenavelPara(b, ordem.col);
        if (va < vb) return -1 * ordem.dir;
        if (va > vb) return 1 * ordem.dir;
        return 0;
      });
    }
    return out;
  }, [artigos, busca, filtros, ordem]);

  const temFiltro = busca.trim() !== "" || Object.values(filtros).some((v) => v?.trim());

  return (
    <div>
      {/* Busca global */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-md">
          <svg
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, autor, ID, status…"
            className="hce-input pl-9"
            type="search"
          />
        </div>
        {temFiltro && (
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setFiltros({});
            }}
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            Limpar filtros
          </button>
        )}
        <span className="text-sm text-muted">
          {linhas.length} de {artigos.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
              {COLUNAS.map((c) => {
                const ativo = ordem?.col === c.key;
                return (
                  <th
                    key={c.key}
                    className="px-4 py-3 font-semibold whitespace-nowrap"
                  >
                    <button
                      type="button"
                      onClick={() => clicarColuna(c.key)}
                      className="flex items-center gap-1 uppercase transition-colors hover:text-brand-blue"
                      title="Clique para ordenar"
                    >
                      {c.label}
                      <span
                        className={
                          "text-[10px] " +
                          (ativo ? "text-brand-blue" : "text-line")
                        }
                        aria-hidden
                      >
                        {ativo ? (ordem!.dir === 1 ? "▲" : "▼") : "↕"}
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Ações
              </th>
            </tr>
            {/* Linha de filtros por coluna */}
            <tr className="border-b border-line bg-white">
              {COLUNAS.map((c) => (
                <th key={c.key} className="px-2 py-2 align-top">
                  {c.tipo === "custom" ? null : c.tipo === "status" ? (
                    <select
                      value={filtros[c.key] ?? ""}
                      onChange={(e) => setFiltro(c.key, e.target.value)}
                      aria-label={`Filtrar ${c.label}`}
                      className="w-full rounded-md border border-line bg-white px-2 py-1 text-xs font-normal text-ink normal-case"
                    >
                      <option value="">Todos</option>
                      <option value="Publicado">Publicado</option>
                      <option value="Rascunho">Rascunho</option>
                    </select>
                  ) : (
                    <input
                      value={filtros[c.key] ?? ""}
                      onChange={(e) => setFiltro(c.key, e.target.value)}
                      placeholder="Filtrar…"
                      aria-label={`Filtrar ${c.label}`}
                      className="w-full rounded-md border border-line bg-white px-2 py-1 text-xs font-normal text-ink normal-case placeholder:text-muted"
                    />
                  )}
                </th>
              ))}
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUNAS.length + 1}
                  className="px-4 py-10 text-center text-muted"
                >
                  Nenhum artigo encontrado com esses filtros.
                </td>
              </tr>
            ) : (
              linhas.map((a) => (
                <tr key={a.id} className="border-b border-line/70">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {a.capaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.capaUrl}
                          alt={`Capa de ${a.titulo}`}
                          className="h-10 w-14 shrink-0 rounded-md border border-line object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden
                          title="Sem capa"
                          className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface-soft text-muted"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="m21 15-5-5L5 21" />
                          </svg>
                        </span>
                      )}
                      <span className="font-mono text-xs font-semibold text-brand-blue">
                        {a.codigo}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/adm/feed/${a.id}`}
                      className="font-medium text-brand-blue hover:underline"
                    >
                      {a.titulo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.publicado ? (
                      <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                        Publicado
                      </span>
                    ) : (
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        Rascunho
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.reacoesTotal === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        {REACOES.map((r) => (
                          <span
                            key={r.tipo}
                            title={`${r.label}: ${a.reacoes[r.tipo]}`}
                            className={
                              "inline-flex items-center gap-0.5 text-sm " +
                              (a.reacoes[r.tipo] > 0 ? "text-ink" : "text-muted/50")
                            }
                          >
                            <span aria-hidden>{r.emoji}</span>
                            <span className="tabular-nums">
                              {a.reacoes[r.tipo]}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-ink">
                        {a.comentariosAprovados}
                      </span>
                      {a.comentariosPendentes > 0 && (
                        <Link
                          href="/adm/comentarios"
                          title={`${a.comentariosPendentes} aguardando aprovação`}
                          className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:bg-amber-200"
                        >
                          +{a.comentariosPendentes} pend.
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {a.autor}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {a.criadoFmt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {a.atualizadoFmt}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ArtigoAcoes
                      id={a.id}
                      slug={a.slug}
                      publicado={a.publicado}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
