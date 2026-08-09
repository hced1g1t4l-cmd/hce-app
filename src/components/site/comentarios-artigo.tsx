"use client";

import { useState } from "react";
import { normalizarHandle } from "@/lib/handle";
import { cn } from "@/lib/cn";

export type ComentarioPublico = {
  id: string;
  texto: string;
  autorNome: string;
  autorHandle: string | null;
  autorFoto: string | null;
  dataFmt: string;
  ehHce: boolean;
  respostas: ComentarioPublico[];
};

function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  const a = p[0]?.[0] ?? "";
  const b = p.length > 1 ? (p[p.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "?";
}

function Avatar({
  nome,
  foto,
  ehHce,
  pequeno,
}: {
  nome: string;
  foto: string | null;
  ehHce?: boolean;
  pequeno?: boolean;
}) {
  const tam = pequeno ? "h-8 w-8" : "h-10 w-10";
  if (foto) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={foto}
        alt=""
        className={cn(
          tam,
          "shrink-0 rounded-full object-cover",
          ehHce && "ring-2 ring-brand-amber",
        )}
      />
    );
  }
  if (ehHce) {
    return (
      <span
        className={cn(
          tam,
          "flex shrink-0 items-center justify-center rounded-full bg-brand-blue text-[0.62rem] font-extrabold tracking-tight text-brand-amber ring-2 ring-brand-amber",
        )}
      >
        HCE
      </span>
    );
  }
  return (
    <span
      className={cn(
        tam,
        "flex shrink-0 items-center justify-center rounded-full bg-brand-blue/10 font-display text-sm font-bold text-brand-blue",
      )}
    >
      {iniciais(nome)}
    </span>
  );
}

// Uma linha de comentario/resposta (avatar + cabecalho + texto).
function LinhaComentario({
  c,
  pequeno,
}: {
  c: ComentarioPublico;
  pequeno?: boolean;
}) {
  return (
    <div className={cn("flex gap-3.5", pequeno && "gap-3")}>
      <Avatar
        nome={c.autorNome}
        foto={c.autorFoto}
        ehHce={c.ehHce}
        pequeno={pequeno}
      />
      <div
        className={cn(
          "min-w-0 flex-1",
          c.ehHce && "rounded-xl bg-brand-amber-soft/40 px-3.5 py-2.5",
        )}
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-sm font-bold text-ink">
            {c.autorNome}
          </span>
          {c.ehHce ? (
            <span className="rounded-full bg-brand-amber px-2 py-0.5 text-[0.68rem] font-bold text-brand-blue-deep">
              Equipe HCE
            </span>
          ) : (
            c.autorHandle && (
              <span className="text-sm text-brand-blue">@{c.autorHandle}</span>
            )
          )}
          <span className="text-xs text-muted">· {c.dataFmt}</span>
        </div>
        <p className="mt-1 leading-relaxed whitespace-pre-line text-ink">
          {c.texto}
        </p>
      </div>
    </div>
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

  // Estado do formulario de resposta (um aberto por vez).
  const [respAlvo, setRespAlvo] = useState<string | null>(null);
  const [respTexto, setRespTexto] = useState("");
  const [respEnviando, setRespEnviando] = useState(false);
  const [respErro, setRespErro] = useState<string | null>(null);
  const [respOk, setRespOk] = useState<string | null>(null);
  const [respOkAlvo, setRespOkAlvo] = useState<string | null>(null);

  async function postComentario(payload: { texto: string; parentId?: string }) {
    const res = await fetch("/api/feed/comentario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artigoId,
        texto: payload.texto,
        parentId: payload.parentId,
        handle: precisaHandle ? handle : undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      needsHandle?: boolean;
    };
    return { res, data };
  }

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
      const { res, data } = await postComentario({ texto });
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

  function abrirResposta(id: string) {
    setRespAlvo((atual) => (atual === id ? null : id));
    setRespTexto("");
    setRespErro(null);
    setRespOk(null);
    setRespOkAlvo(null);
  }

  async function enviarResposta(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    setRespErro(null);
    setRespOk(null);
    if (respTexto.trim().length < 2) {
      setRespErro("Escreva uma resposta.");
      return;
    }
    setRespEnviando(true);
    try {
      const { res, data } = await postComentario({ texto: respTexto, parentId });
      if (!res.ok) {
        if (data.needsHandle) setPrecisaHandle(true);
        setRespErro(data.error || "Não foi possível enviar.");
        return;
      }
      setRespOk(data.message || "Resposta enviada para aprovação.");
      setRespOkAlvo(parentId);
      setRespTexto("");
      setPrecisaHandle(false);
      setRespAlvo(null);
    } catch {
      setRespErro("Falha de conexão. Tente novamente.");
    } finally {
      setRespEnviando(false);
    }
  }

  const campoHandle = (
    <label className="mb-4 block">
      <span className="font-display text-sm font-semibold text-brand-blue">
        Defina seu @ para participar
      </span>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted">
          @
        </span>
        <input
          value={handle}
          onChange={(e) => setHandle(normalizarHandle(e.target.value) ?? "")}
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
  );

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
      <form
        onSubmit={enviar}
        className="mt-5 rounded-2xl border border-line bg-white p-5"
      >
        {precisaHandle && campoHandle}

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
        <ul className="mt-6 space-y-6">
          {lista.map((c) => (
            <li key={c.id}>
              <LinhaComentario c={c} />

              {/* RESPOSTAS */}
              {c.respostas.length > 0 && (
                <ul className="mt-4 ml-6 space-y-4 border-l-2 border-line pl-4 sm:ml-12">
                  {c.respostas.map((r) => (
                    <li key={r.id}>
                      <LinhaComentario c={r} pequeno />
                    </li>
                  ))}
                </ul>
              )}

              {/* RESPONDER */}
              <div className="mt-2.5 ml-[3.375rem]">
                {respAlvo === c.id ? (
                  <form onSubmit={(e) => enviarResposta(e, c.id)}>
                    {precisaHandle && campoHandle}
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
                      <p className="mt-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                        {respErro}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={respEnviando}
                        className="inline-flex min-h-9 items-center justify-center rounded-full bg-brand-amber px-4 py-1.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {respEnviando ? "Enviando…" : "Enviar resposta"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRespAlvo(null)}
                        className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => abrirResposta(c.id)}
                    className="text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-deep"
                  >
                    Responder
                  </button>
                )}
                {respOk && respOkAlvo === c.id && (
                  <p className="mt-2 text-xs font-medium text-green-700">
                    {respOk}
                  </p>
                )}
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
