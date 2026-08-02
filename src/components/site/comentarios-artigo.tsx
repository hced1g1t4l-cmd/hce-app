"use client";

import { useState } from "react";
import { normalizarHandle } from "@/lib/handle";

export type ComentarioPublico = {
  id: string;
  texto: string;
  autorNome: string;
  autorHandle: string | null;
  autorFoto: string | null;
  dataFmt: string;
};

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  const a = p[0]?.[0] ?? "";
  const b = p.length > 1 ? (p[p.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "?";
}

function Avatar({ nome, foto }: { nome: string; foto: string | null }) {
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={foto}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm font-bold text-brand-blue">
      {iniciais(nome)}
    </span>
  );
}

export function ComentariosArtigo({
  artigoId,
  comentarios,
  meuHandle,
}: {
  artigoId: string;
  comentarios: ComentarioPublico[];
  meuHandle: string | null;
}) {
  const [lista] = useState(comentarios);
  const [texto, setTexto] = useState("");
  const [handle, setHandle] = useState("");
  const [precisaHandle, setPrecisaHandle] = useState(meuHandle == null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    if (texto.trim().length < 2) {
      setErro("Escreva um comentário.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/feed/comentario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artigoId,
          texto,
          handle: precisaHandle ? handle : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        needsHandle?: boolean;
      };
      if (!res.ok) {
        if (data.needsHandle) setPrecisaHandle(true);
        setErro(data.error || "Não foi possível enviar.");
        return;
      }
      setOk(data.message || "Comentário enviado para aprovação.");
      setTexto("");
      setPrecisaHandle(false);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-brand-blue">
        Comentários
        {lista.length > 0 && (
          <span className="ml-2 text-base font-normal text-muted">
            ({lista.length})
          </span>
        )}
      </h2>

      {/* FORMULÁRIO */}
      <form onSubmit={enviar} className="mt-5 rounded-2xl border border-line bg-white p-5">
        {precisaHandle && (
          <label className="mb-4 block">
            <span className="font-display text-sm font-semibold text-brand-blue">
              Defina seu @ para comentar
            </span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
                @
              </span>
              <input
                value={handle}
                onChange={(e) =>
                  setHandle(normalizarHandle(e.target.value) ?? "")
                }
                type="text"
                autoCapitalize="none"
                autoComplete="off"
                spellCheck={false}
                placeholder="seunome"
                maxLength={30}
                className="hce-input mt-0 pl-8"
              />
            </div>
            <span className="mt-1 block text-xs text-muted">
              Único e público. É assim que você aparecerá nos comentários.
            </span>
          </label>
        )}

        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Escreva um comentário respeitoso…"
          className="hce-input resize-y"
        />

        {erro && (
          <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {erro}
          </p>
        )}
        {ok && (
          <p className="mt-3 rounded-lg bg-green-50 px-4 py-2.5 text-sm text-green-700">
            {ok}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Os comentários passam por aprovação antes de aparecer.
          </p>
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-5 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Comentar"}
          </button>
        </div>
      </form>

      {/* LISTA */}
      {lista.length > 0 ? (
        <ul className="mt-6 space-y-5">
          {lista.map((c) => (
            <li key={c.id} className="flex gap-3.5">
              <Avatar nome={c.autorNome} foto={c.autorFoto} />
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
                  <span className="text-xs text-muted">· {c.dataFmt}</span>
                </div>
                <p className="mt-1 leading-relaxed whitespace-pre-line text-ink">
                  {c.texto}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">
          Ainda não há comentários. Seja o primeiro a participar.
        </p>
      )}
    </div>
  );
}
