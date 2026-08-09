"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type ComentarioAdm = {
  id: string;
  texto: string;
  status: "pendente" | "aprovado" | "reprovado";
  ehHce: boolean; // resposta oficial da HCE (autor = admin)
  ehResposta: boolean; // é resposta a outro comentário
  podeResponder: boolean; // 1º nível → aceita resposta da HCE
  autorNome: string;
  autorHandle: string | null;
  autorFoto: string | null;
  artigoTitulo: string;
  artigoSlug: string;
  criadoFmt: string;
};

const FILTROS: { id: ComentarioAdm["status"] | "todos"; label: string }[] = [
  { id: "pendente", label: "Pendentes" },
  { id: "aprovado", label: "Aprovados" },
  { id: "reprovado", label: "Reprovados" },
  { id: "todos", label: "Todos" },
];

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? (p[p.length - 1]?.[0] ?? "") : ""))
    .toUpperCase() || "?";
}

const BADGE: Record<ComentarioAdm["status"], string> = {
  pendente: "bg-amber-100 text-amber-800",
  aprovado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-700",
};

export function ComentariosModerar({
  comentarios,
}: {
  comentarios: ComentarioAdm[];
}) {
  const router = useRouter();
  const [filtro, setFiltro] = useState<ComentarioAdm["status"] | "todos">(
    "pendente",
  );
  const [busca, setBusca] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [respAlvo, setRespAlvo] = useState<string | null>(null);
  const [respTexto, setRespTexto] = useState("");
  const [respErro, setRespErro] = useState<string | null>(null);

  const contagem = useMemo(() => {
    const c = { pendente: 0, aprovado: 0, reprovado: 0 };
    for (const x of comentarios) c[x.status]++;
    return c;
  }, [comentarios]);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return comentarios.filter((c) => {
      if (filtro !== "todos" && c.status !== filtro) return false;
      if (!q) return true;
      return (
        c.texto.toLowerCase().includes(q) ||
        c.autorNome.toLowerCase().includes(q) ||
        (c.autorHandle ?? "").toLowerCase().includes(q) ||
        c.artigoTitulo.toLowerCase().includes(q)
      );
    });
  }, [comentarios, filtro, busca]);

  async function moderar(id: string, acao: "aprovar" | "reprovar") {
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/comentarios/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      if (res.ok) router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  async function responderHce(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    setRespErro(null);
    if (respTexto.trim().length < 2) {
      setRespErro("Escreva uma resposta.");
      return;
    }
    setOcupado(parentId);
    try {
      const res = await fetch("/api/adm/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId, texto: respTexto }),
      });
      if (res.ok) {
        setRespAlvo(null);
        setRespTexto("");
        router.refresh();
      } else {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setRespErro(d.error || "Não foi possível enviar.");
      }
    } finally {
      setOcupado(null);
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este comentário definitivamente?")) return;
    setOcupado(id);
    try {
      const res = await fetch(`/api/adm/comentarios/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTROS.map((f) => {
          const n =
            f.id === "todos"
              ? comentarios.length
              : contagem[f.id as ComentarioAdm["status"]];
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filtro === f.id
                  ? "bg-brand-blue text-white"
                  : "border border-line bg-white text-ink hover:bg-surface-soft"
              }`}
            >
              {f.label} <span className="opacity-70">({n})</span>
            </button>
          );
        })}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          type="search"
          placeholder="Buscar por texto, autor, @ ou artigo…"
          className="hce-input ml-auto max-w-xs"
        />
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
          Nenhum comentário nesse filtro.
        </p>
      ) : (
        <ul className="space-y-3">
          {lista.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-line bg-white p-4 sm:p-5"
            >
              <div className="flex items-start gap-3.5">
                {c.autorFoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.autorFoto}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm font-bold text-brand-blue">
                    {iniciais(c.autorNome)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-display text-sm font-bold text-ink">
                      {c.autorNome}
                    </span>
                    {c.autorHandle && (
                      <span className="text-sm text-brand-blue">
                        @{c.autorHandle}
                      </span>
                    )}
                    <span className="text-xs text-muted">· {c.criadoFmt}</span>
                    {c.ehHce && (
                      <span className="rounded-full bg-brand-amber px-2 py-0.5 text-xs font-bold text-brand-blue-deep">
                        HCE
                      </span>
                    )}
                    {c.ehResposta && !c.ehHce && (
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        resposta
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[c.status]}`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <p className="mt-1 leading-relaxed whitespace-pre-line text-ink">
                    {c.texto}
                  </p>
                  <p className="mt-1.5 text-xs text-muted">
                    em{" "}
                    <a
                      href={`/feed/${c.artigoSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-blue hover:underline"
                    >
                      {c.artigoTitulo}
                    </a>
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                {c.podeResponder && (
                  <button
                    type="button"
                    onClick={() => {
                      setRespAlvo((a) => (a === c.id ? null : c.id));
                      setRespTexto("");
                      setRespErro(null);
                    }}
                    className="mr-auto rounded-full bg-brand-amber px-4 py-2 text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
                  >
                    Responder como HCE
                  </button>
                )}
                {c.status !== "aprovado" && (
                  <button
                    type="button"
                    onClick={() => moderar(c.id, "aprovar")}
                    disabled={ocupado === c.id}
                    className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                  >
                    Aprovar
                  </button>
                )}
                {c.status !== "reprovado" && (
                  <button
                    type="button"
                    onClick={() => moderar(c.id, "reprovar")}
                    disabled={ocupado === c.id}
                    className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-60"
                  >
                    Reprovar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => excluir(c.id)}
                  disabled={ocupado === c.id}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                >
                  Excluir
                </button>
              </div>

              {respAlvo === c.id && (
                <form
                  onSubmit={(e) => responderHce(e, c.id)}
                  className="mt-3 rounded-xl border border-brand-amber/40 bg-brand-amber-soft/30 p-3"
                >
                  <p className="mb-2 text-xs font-semibold text-brand-blue-deep">
                    Resposta oficial da HCE (aparece aprovada, com selo{" "}
                    <span className="font-bold">Equipe HCE</span>)
                  </p>
                  <textarea
                    value={respTexto}
                    onChange={(e) => setRespTexto(e.target.value)}
                    rows={2}
                    maxLength={2000}
                    autoFocus
                    placeholder={`Responder a ${c.autorNome}…`}
                    className="hce-input resize-y"
                  />
                  {respErro && (
                    <p className="mt-2 text-sm text-red-700">{respErro}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={ocupado === c.id}
                      className="rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-60"
                    >
                      {ocupado === c.id ? "Enviando…" : "Enviar resposta"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespAlvo(null)}
                      className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
