"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Recaptcha, type RecaptchaHandle } from "@/components/site/recaptcha";

export function EsqueciSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const captcha = useRef<RecaptchaHandle>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);

    let captchaToken: string | undefined;
    if (captcha.current?.habilitado) {
      captchaToken = captcha.current.getToken();
      if (!captchaToken) {
        setErro("Confirme que você não é um robô.");
        return;
      }
    }

    const payload = {
      email: String(fd.get("email") || ""),
      website: String(fd.get("website") || ""),
      captchaToken,
    };

    setEnviando(true);
    try {
      const res = await fetch("/api/conta/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        captcha.current?.reset();
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível enviar. Tente novamente.");
        setEnviando(false);
        return;
      }
      setEnviado(true);
    } catch {
      captcha.current?.reset();
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
        <h2 className="font-display text-xl font-bold text-brand-blue">
          Verifique seu e-mail
        </h2>
        <p className="mt-3 leading-relaxed text-muted">
          Se existir uma conta com esse e-mail, enviamos um link para redefinir a
          senha. O link vale por 1 hora. Não esqueça de olhar o spam.
        </p>
        <Link
          href="/entrar"
          className="mt-6 inline-block font-semibold text-brand-blue hover:underline"
        >
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
    >
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <label className="block">
        <span className="font-display text-sm font-semibold text-brand-blue">
          E-mail da conta
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

      <Recaptcha ref={captcha} />

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
        {enviando ? "Enviando…" : "Enviar link de redefinição"}
      </button>

      <p className="mt-5 text-center text-sm text-muted">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-semibold text-brand-blue hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
