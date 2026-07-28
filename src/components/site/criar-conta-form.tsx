"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

function destinoSeguro(redirect?: string): string {
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return "/conta";
}

export function CriarContaForm({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);

    if (!fd.get("aceite")) {
      setErro("Você precisa aceitar os termos para criar a conta.");
      return;
    }

    let captchaToken: string | undefined;
    if (SITE_KEY) {
      const g = (window as unknown as { grecaptcha?: { getResponse: () => string } })
        .grecaptcha;
      captchaToken = g?.getResponse();
      if (!captchaToken) {
        setErro("Confirme que você não é um robô.");
        return;
      }
    }

    const payload = {
      nome: String(fd.get("nome") || ""),
      email: String(fd.get("email") || ""),
      senha: String(fd.get("senha") || ""),
      telefone: String(fd.get("telefone") || ""),
      aceitaComunicacoes: fd.get("aceitaComunicacoes") === "on",
      website: String(fd.get("website") || ""),
      captchaToken,
    };

    setEnviando(true);
    try {
      const res = await fetch("/api/conta/registrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível criar a conta.");
        setEnviando(false);
        return;
      }
      // Conta criada e sessão aberta. A verificação de e-mail é obrigatória:
      // levamos a pessoa para a tela que envia e confere o código.
      const dest = destinoSeguro(redirect);
      router.push(`/verificar-email?apos=${encodeURIComponent(dest)}`);
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  const entrarHref = redirect
    ? `/entrar?redirect=${encodeURIComponent(redirect)}`
    : "/entrar";

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
    >
      {SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" async defer />
      )}
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Nome completo
          </span>
          <input
            name="nome"
            type="text"
            required
            autoComplete="name"
            placeholder="Seu nome"
            className="hce-input mt-1.5"
          />
        </label>

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
            Telefone{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </span>
          <input
            name="telefone"
            type="tel"
            autoComplete="tel"
            placeholder="(21) 90000-0000"
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
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            className="hce-input mt-1.5"
          />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="aceite"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-brand-blue"
          />
          <span className="leading-snug">
            Li e concordo com os Termos de Uso e a Política de Privacidade,
            autorizando o tratamento dos meus dados conforme a Lei Geral de
            Proteção de Dados (LGPD).
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            name="aceitaComunicacoes"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-brand-blue"
          />
          <span className="leading-snug">
            Desejo receber artigos, novidades e informações da HCE por e-mail.
            Posso cancelar o recebimento a qualquer momento.
          </span>
        </label>
      </div>

      {SITE_KEY && (
        <div className="mt-6 flex justify-center">
          <div className="g-recaptcha" data-sitekey={SITE_KEY} />
        </div>
      )}

      {erro && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-amber px-6 py-3 text-center font-display text-base font-semibold text-brand-blue-deep transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Criando conta…" : "Criar conta grátis"}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link
          href={entrarHref}
          className="font-semibold text-brand-blue hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
