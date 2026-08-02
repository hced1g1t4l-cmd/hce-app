"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PRIORIDADES,
  STATUS,
  prioridadeInfo,
  statusInfo,
  type Prioridade,
  type BacklogAcao,
} from "@/lib/backlog";
import { BacklogDescricao } from "@/components/adm/backlog-descricao";
import { baixarCSV, baixarXLS } from "@/lib/export-cliente";

export type BacklogRow = {
  id: string;
  codigo: string;
  titulo: string;
  descricaoHtml: string;
  temDescricao: boolean;
  prioridade: string;
  status: string;
  criadoPorNome: string;
  criadoFmt: string;
  criadoTs: number;
  iniciadoPorNome: string | null;
  iniciadoFmt: string | null;
  concluidoPorNome: string | null;
  concluidoFmt: string | null;
  canceladoPorNome: string | null;
  canceladoFmt: string | null;
};

const FILTROS: { valor: string; label: string }[] = [
  { valor: "ativos", label: "Ativos" },
  { valor: "todos", label: "Todos" },
  ...STATUS.map((s) => ({ valor: s.valor, label: s.label })),
];

export function BacklogPainel({ itens }: { itens: BacklogRow[] }) {
  const router = useRouter();

  // --- Novo item ---
  const [novoAberto, setNovoAberto] = useState(false);
  const tituloRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [prioridade, setPrioridade] = useState<Prioridade>("media");
  const [salvando, setSalvando] = useState(false);
  const [erroNovo, setErroNovo] = useState<string | null>(null);

  // --- Lista ---
  const [filtro, setFiltro] = useState("ativos");
  const [autor, setAutor] = useState("");
  const [busca, setBusca] = useState("");

  const autores = useMemo(
    () =>
      Array.from(new Set(itens.map((i) => i.criadoPorNome))).sort((a, b) =>
        a.localeCompare(b, "pt-BR"),
      ),
    [itens],
  );
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);

  // --- Edição ---
  const [editId, setEditId] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    const titulo = tituloRef.current?.value.trim() ?? "";
    const descricao = descRef.current?.innerHTML ?? "";
    if (!titulo) {
      setErroNovo("Dê um nome ao item.");
      return;
    }
    setSalvando(true);
    setErroNovo(null);
    try {
      const res = await fetch("/api/adm/backlog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, prioridade }),
      });
      if (res.ok) {
        if (tituloRef.current) tituloRef.current.value = "";
        if (descRef.current) descRef.current.innerHTML = "";
        setPrioridade("media");
        setNovoAberto(false);
        router.refresh();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErroNovo(d.error || "Não foi possível salvar.");
      }
    } finally {
      setSalvando(false);
    }
  }

  async function transicao(id: string, acao: BacklogAcao) {
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/backlog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      if (res.ok) router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este item do backlog? Esta ação não pode ser desfeita."))
      return;
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/backlog/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens
      .filter((it) => {
        if (filtro === "ativos")
          return it.status === "aberto" || it.status === "em_andamento";
        if (filtro !== "todos") return it.status === filtro;
        return true;
      })
      .filter((it) => !autor || it.criadoPorNome === autor)
      .filter((it) => {
        if (!q) return true;
        return (
          it.titulo.toLowerCase().includes(q) ||
          it.codigo.toLowerCase().includes(q) ||
          it.criadoPorNome.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const sa = statusInfo(a.status).ordem - statusInfo(b.status).ordem;
        if (sa !== 0) return sa;
        const pa =
          prioridadeInfo(a.prioridade).ordem - prioridadeInfo(b.prioridade).ordem;
        if (pa !== 0) return pa;
        return a.criadoTs - b.criadoTs;
      });
  }, [itens, filtro, autor, busca]);

  // Exportação (CSV / Excel) do que está filtrado na tela.
  function dadosExport(): { colunas: string[]; linhas: string[][] } {
    const colunas = [
      "Código",
      "BAC",
      "Título",
      "Prioridade",
      "Status",
      "Criado por",
      "Criado em",
      "Início",
      "Conclusão",
      "Cancelamento",
    ];
    const dados = filtrados.map((it) => {
      const idx = it.titulo.indexOf(" · ");
      const codigo = idx > 0 ? it.titulo.slice(0, idx) : "";
      const titulo = idx > 0 ? it.titulo.slice(idx + 3) : it.titulo;
      return [
        codigo,
        it.codigo,
        titulo,
        prioridadeInfo(it.prioridade).label,
        statusInfo(it.status).label,
        it.criadoPorNome,
        it.criadoFmt,
        it.iniciadoFmt ?? "",
        it.concluidoFmt ?? "",
        it.canceladoFmt ?? "",
      ];
    });
    return { colunas, linhas: dados };
  }

  function nomeArquivo(ext: string): string {
    const hoje = new Date().toISOString().slice(0, 10);
    return `hce-backlog-${hoje}.${ext}`;
  }

  function exportarCSV() {
    const { colunas, linhas: dados } = dadosExport();
    baixarCSV(nomeArquivo("csv"), colunas, dados);
  }

  function exportarXLS() {
    const { colunas, linhas: dados } = dadosExport();
    const geradoEm = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    baixarXLS(nomeArquivo("xls"), "Backlog do time", colunas, dados, geradoEm);
  }

  const itemEdit = itens.find((i) => i.id === editId) ?? null;

  return (
    <div>
      {/* NOVO ITEM */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        {!novoAberto ? (
          <button
            onClick={() => setNovoAberto(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-blue/40 bg-brand-blue/5 py-3 font-semibold text-brand-blue transition-colors hover:bg-brand-blue/10"
          >
            <span className="text-lg leading-none">+</span> Novo item de backlog
          </button>
        ) : (
          <form onSubmit={criar} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
              <label className="block">
                <span className="font-display text-sm font-semibold text-brand-blue">
                  Nome curto
                </span>
                <input
                  ref={tituloRef}
                  type="text"
                  maxLength={180}
                  placeholder="Ex.: Prévia pública dos artigos do Feed"
                  className="hce-input mt-1.5"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="font-display text-sm font-semibold text-brand-blue">
                  Prioridade
                </span>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                  className="hce-input mt-1.5"
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Descrição
              </span>
              <div className="mt-1.5">
                <BacklogDescricao
                  ref={descRef}
                  placeholder="Descreva o item. Cole imagens com Ctrl+V."
                  onErro={setErroNovo}
                />
              </div>
            </label>

            {erroNovo && (
              <p className="text-sm font-medium text-red-600">{erroNovo}</p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={salvando}
                className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-60"
              >
                {salvando ? "Salvando…" : "Salvar item"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNovoAberto(false);
                  setErroNovo(null);
                }}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-soft"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FILTROS + BUSCA */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="hce-scroll-x -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors " +
                (filtro === f.valor
                  ? "bg-brand-blue text-white"
                  : "bg-white text-muted ring-1 ring-line hover:bg-surface-soft")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="hce-input sm:w-48"
            aria-label="Filtrar por quem criou"
          >
            <option value="">Todos os autores</option>
            {autores.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, código ou autor…"
            className="hce-input sm:max-w-xs"
          />
        </div>
      </div>

      {/* EXPORTAR */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted">
          {filtrados.length} item(ns) no filtro atual
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            disabled={filtrados.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportarXLS}
            disabled={filtrados.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-deep disabled:opacity-50"
          >
            Exportar Excel
          </button>
        </div>
      </div>

      {/* LISTA */}
      <div className="mt-4 space-y-3">
        {filtrados.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-white px-4 py-10 text-center text-muted">
            Nenhum item por aqui.
          </p>
        )}

        {filtrados.map((it) => {
          const p = prioridadeInfo(it.prioridade);
          const s = statusInfo(it.status);
          const expandido = aberto === it.id;
          const busy = ocupado === it.id;
          return (
            <div
              key={it.id}
              className="rounded-2xl border border-line bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-muted">
                      {it.codigo}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        p.badge
                      }
                    >
                      {p.label}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        s.badge
                      }
                    >
                      {s.label}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-ink">
                    {it.titulo}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Criado por {it.criadoPorNome} · {it.criadoFmt}
                  </p>
                </div>

                {/* AÇÕES por status */}
                <div className="flex flex-wrap items-center gap-2">
                  {it.status === "aberto" && (
                    <button
                      onClick={() => transicao(it.id, "iniciar")}
                      disabled={busy}
                      className="rounded-full bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                    >
                      Pegar para fazer
                    </button>
                  )}
                  {it.status === "em_andamento" && (
                    <button
                      onClick={() => transicao(it.id, "concluir")}
                      disabled={busy}
                      className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Concluir
                    </button>
                  )}
                  {(it.status === "aberto" || it.status === "em_andamento") && (
                    <button
                      onClick={() => transicao(it.id, "cancelar")}
                      disabled={busy}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50 disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  )}
                  {(it.status === "concluido" || it.status === "cancelado") && (
                    <button
                      onClick={() => transicao(it.id, "reabrir")}
                      disabled={busy}
                      className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-blue ring-1 ring-line transition-colors hover:bg-surface-soft disabled:opacity-60"
                    >
                      Reabrir
                    </button>
                  )}
                  <button
                    onClick={() => setEditId(it.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-line transition-colors hover:bg-surface-soft"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setAberto(expandido ? null : it.id)}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted ring-1 ring-line transition-colors hover:bg-surface-soft"
                  >
                    {expandido ? "Fechar" : "Detalhes"}
                  </button>
                </div>
              </div>

              {expandido && (
                <div className="border-t border-line px-4 py-4">
                  {it.temDescricao ? (
                    <div
                      className="prose-descricao text-sm leading-relaxed text-ink [&_a]:text-brand-blue [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: it.descricaoHtml }}
                    />
                  ) : (
                    <p className="text-sm text-muted">Sem descrição.</p>
                  )}

                  {/* Linha do tempo */}
                  <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
                    <p>
                      <b className="text-ink">Criado</b> por {it.criadoPorNome} ·{" "}
                      {it.criadoFmt}
                    </p>
                    {it.iniciadoFmt && (
                      <p>
                        <b className="text-ink">Em andamento</b> desde{" "}
                        {it.iniciadoFmt}
                        {it.iniciadoPorNome ? ` · ${it.iniciadoPorNome}` : ""}
                      </p>
                    )}
                    {it.concluidoFmt && (
                      <p>
                        <b className="text-ink">Concluído</b> em {it.concluidoFmt}
                        {it.concluidoPorNome ? ` · ${it.concluidoPorNome}` : ""}
                      </p>
                    )}
                    {it.canceladoFmt && (
                      <p>
                        <b className="text-ink">Cancelado</b> em {it.canceladoFmt}
                        {it.canceladoPorNome ? ` · ${it.canceladoPorNome}` : ""}
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => excluir(it.id)}
                      disabled={busy}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
                    >
                      Excluir permanentemente
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {itemEdit && (
        <EditarModal
          item={itemEdit}
          onFechar={() => setEditId(null)}
          onSalvo={() => {
            setEditId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function EditarModal({
  item,
  onFechar,
  onSalvo,
}: {
  item: BacklogRow;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const tituloRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const [prioridade, setPrioridade] = useState<Prioridade>(
    (item.prioridade as Prioridade) ?? "media",
  );
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const titulo = tituloRef.current?.value.trim() ?? "";
    const descricao = descRef.current?.innerHTML ?? "";
    if (!titulo) {
      setErro("Dê um nome ao item.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/adm/backlog/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, descricao, prioridade }),
      });
      if (res.ok) onSalvo();
      else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível salvar.");
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-brand-blue">
            Editar {item.codigo}
          </h2>
          <button
            onClick={onFechar}
            className="rounded-full px-2 py-1 text-muted hover:bg-surface-soft"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={salvar} className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Nome curto
              </span>
              <input
                ref={tituloRef}
                type="text"
                maxLength={180}
                defaultValue={item.titulo}
                className="hce-input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Prioridade
              </span>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Prioridade)}
                className="hce-input mt-1.5"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="font-display text-sm font-semibold text-brand-blue">
              Descrição
            </span>
            <div className="mt-1.5">
              <BacklogDescricao
                ref={descRef}
                defaultHtml={item.descricaoHtml}
                placeholder="Descreva o item. Cole imagens com Ctrl+V."
                onErro={setErro}
              />
            </div>
          </label>

          {erro && <p className="text-sm font-medium text-red-600">{erro}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-60"
            >
              {salvando ? "Salvando…" : "Salvar alterações"}
            </button>
            <button
              type="button"
              onClick={onFechar}
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-soft"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
