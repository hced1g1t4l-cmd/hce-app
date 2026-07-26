"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

type Status = "idle" | "sending" | "done";

export default function FaleComAHcePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const form = e.currentTarget;
    const fd = new FormData(form);

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
      telefone: String(fd.get("telefone") || ""),
      mensagem: String(fd.get("mensagem") || ""),
      permiteEmail: fd.get("permiteEmail") === "on",
      permiteTelefone: fd.get("permiteTelefone") === "on",
      website: String(fd.get("website") || ""),
      captchaToken,
    };

    setStatus("sending");
    try {
      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível enviar. Tente novamente.");
        setStatus("idle");
        return;
      }
      setStatus("done");
      setTimeout(() => router.push("/"), 6000);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setStatus("idle");
    }
  }

  return (
    <>
      {SITE_KEY && (
        <Script src="https://www.google.com/recaptcha/api.js" async defer />
      )}
      <SiteHeader />

      <main className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="text-center">
            <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
              Contato
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
              Fale com a HCE
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Conte seu desafio ou sua ideia. Consultoria, treinamento para a
              equipe ou parceria de conteúdo — retornaremos o mais breve
              possível.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
          >
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
            />

            <div className="grid gap-5">
              <Field label="Nome completo" htmlFor="nome">
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  autoComplete="name"
                  className="hce-input"
                  placeholder="Seu nome"
                />
              </Field>

              <Field label="E-mail" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="hce-input"
                  placeholder="voce@email.com"
                />
              </Field>

              <Field label="Telefone / WhatsApp (opcional)" htmlFor="telefone">
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  autoComplete="tel"
                  className="hce-input"
                  placeholder="(21) 90000-0000"
                />
              </Field>

              <Field label="Mensagem" htmlFor="mensagem">
                <textarea
                  id="mensagem"
                  name="mensagem"
                  required
                  rows={5}
                  className="hce-input resize-y"
                  placeholder="Escreva aqui sua mensagem para a HCE..."
                />
              </Field>
            </div>

            <fieldset className="mt-7">
              <legend className="font-display text-sm font-semibold text-brand-blue">
                Como podemos entrar em contato com você?
              </legend>
              <div className="mt-3 space-y-2.5">
                <Checkbox
                  name="permiteEmail"
                  label="Autorizo contato por e-mail"
                />
                <Checkbox
                  name="permiteTelefone"
                  label="Autorizo contato por telefone / WhatsApp"
                />
              </div>
            </fieldset>

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

            <div className="mt-7 flex justify-center">
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-amber px-6 py-3 text-center font-display text-sm leading-snug font-semibold text-brand-blue-deep shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-amber-dark hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber disabled:cursor-not-allowed disabled:opacity-60 sm:px-7 sm:py-3.5 sm:text-base"
              >
                {status === "sending" ? "Enviando..." : "Enviar mensagem"}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-muted">
              Seus dados serão usados apenas para responder seu contato, conforme
              a LGPD. Não compartilhamos com terceiros.
            </p>
          </form>
        </Container>
      </main>

      <SiteFooter />

      {status === "done" && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-brand-blue-deep/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-amber text-2xl font-bold text-brand-blue-deep">
              ✓
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-brand-blue">
              Mensagem enviada!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Obrigado pelo contato. A{" "}
              <strong className="text-brand-blue">HCE</strong> responderá em
              breve.
            </p>
            <div className="mt-6">
              <Button href="/" size="md" variant="blue">
                Voltar para a home
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted">
              Você será redirecionado automaticamente…
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="font-display text-sm font-semibold text-brand-blue">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Checkbox({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-ink">
      <input
        type="checkbox"
        name={name}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-brand-blue"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}
