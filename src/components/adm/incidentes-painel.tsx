"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SEVERIDADES,
  STATUS,
  severidadeInfo,
  statusInfo,
  type Severidade,
  type IncidenteAcao,
} from "@/lib/incidentes";

export type IncidenteRow = {
  id: string;
  codigo: string;
  titulo: string;
  detalhamento: string;
  severidade: string;
  status: string;
  abertoPorNome: string;
  abertoDataFmt: string;
  abertoInput: string;
  abertoTs: number;
  emAndamentoFmt: string | null;
  emAndamentoPorNome: string | null;
  resolvidoFmt: string | null;
  resolvidoPorNome: string | null;
  canceladoFmt: string | null;
  canceladoPorNome: string | null;
  criadoFmt: string;
};

const FILTROS: { valor: string; label: string }[] = [
  { valor: "ativos", label: "Ativos" },
  { valor: "todos", label: "Todos" },
  ...STATUS.map((s) => ({ valor: s.valor, label: s.label })),
];

// Em andamento primeiro (o que se está tratando sobe ao topo), depois abertos,
// depois resolvidos e cancelados.
const ORDEM_STATUS: Record<string, number> = {
  em_andamento: 0,
  aberto: 1,
  resolvido: 2,
  cancelado: 3,
};
function ordemStatus(s: string): number {
  return ORDEM_STATUS[s] ?? 9;
}

// Data de hoje (YYYY-MM-DD) no fuso de São Paulo, para o input date.
function hojeInput(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function IncidentesPainel({ itens }: { itens: IncidenteRow[] }) {
  const router = useRouter();

  // --- Novo incidente ---
  const [novoAberto, setNovoAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [severidade, setSeveridade] = useState<Severidade>("alta");
  const [emAndamento, setEmAndamento] = useState(true);
  const [dataAbertura, setDataAbertura] = useState(hojeInput());
  const [salvando, setSalvando] = useState(false);
  const [erroNovo, setErroNovo] = useState<string | null>(null);

  // --- Lista ---
  const [filtro, setFiltro] = useState("ativos");
  const [busca, setBusca] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aberto, setAberto] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErroNovo("Dê um título ao incidente.");
      return;
    }
    setSalvando(true);
    setErroNovo(null);
    try {
      const res = await fetch("/api/adm/incidentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          detalhamento,
          severidade,
          emAndamento,
          dataAbertura,
        }),
      });
      if (res.ok) {
        setTitulo("");
        setDetalhamento("");
        setSeveridade("alta");
        setEmAndamento(true);
        setDataAbertura(hojeInput());
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

  async function transicao(id: string, acao: IncidenteAcao) {
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/incidentes/${id}`, {
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
    if (
      !confirm("Excluir este incidente? Esta ação não pode ser desfeita.")
    )
      return;
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/incidentes/${id}`, {
        method: "DELETE",
      });
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
      .filter((it) => {
        if (!q) return true;
        return (
          it.titulo.toLowerCase().includes(q) ||
          it.codigo.toLowerCase().includes(q) ||
          it.abertoPorNome.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const sa = ordemStatus(a.status) - ordemStatus(b.status);
        if (sa !== 0) return sa;
        const se =
          severidadeInfo(a.severidade).ordem - severidadeInfo(b.severidade).ordem;
        if (se !== 0) return se;
        return b.abertoTs - a.abertoTs;
      });
  }, [itens, filtro, busca]);

  const itemEdit = itens.find((i) => i.id === editId) ?? null;

  return (
    <div>
      {/* NOVO INCIDENTE */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        {!novoAberto ? (
          <button
            onClick={() => setNovoAberto(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-blue/40 bg-brand-blue/5 py-3 font-semibold text-brand-blue transition-colors hover:bg-brand-blue/10"
          >
            <span className="text-lg leading-none">+</span> Abrir novo incidente
          </button>
        ) : (
          <form onSubmit={criar} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_160px_170px]">
              <label className="block">
                <span className="font-display text-sm font-semibold text-brand-blue">
                  Título
                </span>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={180}
                  placeholder='Ex.: Site "Na Mídia" fora do ar'
                  className="hce-input mt-1.5"
                  autoFocus
                />
              </label>
              <label className="block">
                <span className="font-display text-sm font-semibold text-brand-blue">
                  Severidade
                </span>
                <select
                  value={severidade}
                  onChange={(e) => setSeveridade(e.target.value as Severidade)}
                  className="hce-input mt-1.5"
                >
                  {SEVERIDADES.map((s) => (
                    <option key={s.valor} value={s.valor}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-display text-sm font-semibold text-brand-blue">
                  Data de abertura
                </span>
                <input
                  type="date"
                  value={dataAbertura}
                  onChange={(e) => setDataAbertura(e.target.value)}
                  className="hce-input mt-1.5"
                />
              </label>
            </div>

            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Detalhamento
              </span>
              <textarea
                value={detalhamento}
                onChange={(e) => setDetalhamento(e.target.value)}
                rows={8}
                maxLength={20000}
                placeholder="O que aconteceu, por quê, o que já foi feito, próximos passos…"
                className="hce-input mt-1.5 font-mono text-sm"
              />
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={emAndamento}
                onChange={(e) => setEmAndamento(e.target.checked)}
                className="h-4 w-4 rounded border-line text-brand-blue"
              />
              <span className="text-sm font-medium text-ink">
                Abrir já <b>em andamento</b> (senão entra como “Aberto”)
              </span>
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
                {salvando ? "Salvando…" : "Abrir incidente"}
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
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título, código ou autor…"
          className="hce-input sm:max-w-xs"
        />
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtrados.length} incidente(s) no filtro atual
      </p>

      {/* LISTA */}
      <div className="mt-3 space-y-3">
        {filtrados.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-white px-4 py-10 text-center text-muted">
            Nenhum incidente por aqui.
          </p>
        )}

        {filtrados.map((it) => {
          const sev = severidadeInfo(it.severidade);
          const st = statusInfo(it.status);
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
                        sev.badge
                      }
                    >
                      {sev.label}
                    </span>
                    <span
                      className={
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                        st.badge
                      }
                    >
                      {st.label}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-ink">
                    {it.titulo}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">
                    Aberto por {it.abertoPorNome} · {it.abertoDataFmt}
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
                      Pegar para tratar
                    </button>
                  )}
                  {it.status === "em_andamento" && (
                    <button
                      onClick={() => transicao(it.id, "resolver")}
                      disabled={busy}
                      className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Resolver
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
                  {(it.status === "resolvido" || it.status === "cancelado") && (
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
                  {it.detalhamento.trim() ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">
                      {it.detalhamento}
                    </p>
                  ) : (
                    <p className="text-sm text-muted">Sem detalhamento.</p>
                  )}

                  {/* Linha do tempo */}
                  <div className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-muted">
                    <p>
                      <b className="text-ink">Aberto</b> por {it.abertoPorNome} ·{" "}
                      {it.abertoDataFmt}
                    </p>
                    {it.emAndamentoFmt && (
                      <p>
                        <b className="text-ink">Em andamento</b> desde{" "}
                        {it.emAndamentoFmt}
                        {it.emAndamentoPorNome
                          ? ` · ${it.emAndamentoPorNome}`
                          : ""}
                      </p>
                    )}
                    {it.resolvidoFmt && (
                      <p>
                        <b className="text-ink">Resolvido</b> em {it.resolvidoFmt}
                        {it.resolvidoPorNome ? ` · ${it.resolvidoPorNome}` : ""}
                      </p>
                    )}
                    {it.canceladoFmt && (
                      <p>
                        <b className="text-ink">Cancelado</b> em {it.canceladoFmt}
                        {it.canceladoPorNome ? ` · ${it.canceladoPorNome}` : ""}
                      </p>
                    )}
                    <p>
                      <b className="text-ink">Registrado</b> em {it.criadoFmt}
                    </p>
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
  item: IncidenteRow;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const [titulo, setTitulo] = useState(item.titulo);
  const [detalhamento, setDetalhamento] = useState(item.detalhamento);
  const [severidade, setSeveridade] = useState<Severidade>(
    (item.severidade as Severidade) ?? "media",
  );
  const [dataAbertura, setDataAbertura] = useState(item.abertoInput);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) {
      setErro("Dê um título ao incidente.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/adm/incidentes/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, detalhamento, severidade, dataAbertura }),
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
          <div className="grid gap-4 sm:grid-cols-[1fr_160px_170px]">
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Título
              </span>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                maxLength={180}
                className="hce-input mt-1.5"
              />
            </label>
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Severidade
              </span>
              <select
                value={severidade}
                onChange={(e) => setSeveridade(e.target.value as Severidade)}
                className="hce-input mt-1.5"
              >
                {SEVERIDADES.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="font-display text-sm font-semibold text-brand-blue">
                Data de abertura
              </span>
              <input
                type="date"
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="hce-input mt-1.5"
              />
            </label>
          </div>
          <label className="block">
            <span className="font-display text-sm font-semibold text-brand-blue">
              Detalhamento
            </span>
            <textarea
              value={detalhamento}
              onChange={(e) => setDetalhamento(e.target.value)}
              rows={10}
              maxLength={20000}
              className="hce-input mt-1.5 font-mono text-sm"
            />
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
