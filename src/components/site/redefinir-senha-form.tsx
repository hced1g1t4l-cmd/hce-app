"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RedefinirSenhaForm({ token }: { token: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);
    const senha = String(fd.get("senha") || "");
    const confirmar = String(fd.get("confirmar") || "");

    if (senha.length < 8) {
      setErro("A senha precisa de ao menos 8 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch("/api/conta/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível redefinir a senha.");
        setEnviando(false);
        return;
      }
      setOk(true);
      setTimeout(() => router.push("/entrar"), 2500);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          Senha redefinida!
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Sua senha foi atualizada. Você já pode entrar com a nova senha.
        </p>
        <Link
          href="/entrar"
          className="mt-6 inline-block font-semibold text-brand-blue hover:underline"
        >
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Nova senha
          </span>
          <input
            name="senha"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Confirmar nova senha
          </span>
          <input
            name="confirmar"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repita a senha"
            className="hce-input mt-1.5"
          />
        </label>
      </div>

      {erro && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-blue px-6 py-3 text-center font-display text-base font-semibold text-brand-amber transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Salvando…" : "Redefinir senha"}
      </button>
    </form>
  );
}
