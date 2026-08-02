"use client";

import { useState } from "react";

export function EsqueciSenhaForm() {
  const [ident, setIdent] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setMsg(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/adm/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identificador: ident.trim() }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        mensagem?: string;
      };
      if (!res.ok) {
        setErro(d.error || "Não foi possível processar o pedido.");
        setEnviando(false);
        return;
      }
      setMsg(
        d.mensagem ||
          "Se houver uma conta com esses dados, enviaremos o link de recuperação.",
      );
      setEnviando(false);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <label className="block">
        <span className="font-display text-sm font-semibold text-brand-blue">
          Login ou e-mail de resgate
        </span>
        <input
          value={ident}
          onChange={(e) => setIdent(e.target.value)}
          placeholder="ex.: cris.leite"
          className="hce-input mt-1.5"
          autoComplete="username"
        />
      </label>

      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
      {msg && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {msg} Verifique também a caixa de spam.
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || ident.trim().length === 0}
        className="w-full rounded-full bg-brand-blue px-6 py-3 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar link de recuperação"}
      </button>

      <div className="text-center">
        <a
          href="/adm/login"
          className="text-sm font-semibold text-brand-blue hover:underline"
        >
          Voltar ao login
        </a>
      </div>
    </form>
  );
}
