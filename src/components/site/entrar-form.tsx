"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function destinoSeguro(redirect?: string): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/conta";
}

export function EntrarForm({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      email: String(fd.get("email") || ""),
      senha: String(fd.get("senha") || ""),
    };

    setEnviando(true);
    try {
      const res = await fetch("/api/conta/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        needsVerification?: boolean;
      };
      if (!res.ok) {
        setErro(d.error || "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      // E-mail ainda não confirmado: manda para a verificação obrigatória.
      if (d.needsVerification) {
        const dest = destinoSeguro(redirect);
        router.push(`/verificar-email?apos=${encodeURIComponent(dest)}`);
        router.refresh();
        return;
      }
      router.push(destinoSeguro(redirect));
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  const criarHref = redirect
    ? `/criar-conta?redirect=${encodeURIComponent(redirect)}`
    : "/criar-conta";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            E-mail
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@email.com"
            className="hce-input mt-1.5"
          />
        </label>

        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Senha
          </span>
          <input
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Sua senha"
            className="hce-input mt-1.5"
          />
          <Link
            href="/esqueci-senha"
            className="mt-2 inline-block text-sm font-semibold text-brand-blue hover:underline"
          >
            Esqueci minha senha
          </Link>
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
        {enviando ? "Entrando…" : "Entrar"}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link
          href={criarHref}
          className="font-semibold text-brand-blue hover:underline"
        >
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}
