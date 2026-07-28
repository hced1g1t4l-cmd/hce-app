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

// Regras da senha (mesmas do servidor). Cada uma vira um "verdinho" ao vivo.
const REGRAS: { id: string; label: string; ok: (s: string) => boolean }[] = [
  { id: "tam", label: "Pelo menos 6 caracteres", ok: (s) => s.length >= 6 },
  { id: "mai", label: "Uma letra maiúscula", ok: (s) => /[A-Z]/.test(s) },
  { id: "min", label: "Uma letra minúscula", ok: (s) => /[a-z]/.test(s) },
  { id: "num", label: "Um número", ok: (s) => /[0-9]/.test(s) },
  {
    id: "esp",
    label: "Um caractere especial (ex.: ! @ # $ %)",
    ok: (s) => /[^A-Za-z0-9]/.test(s),
  },
];

export function CriarContaForm({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const senhaForte = REGRAS.every((r) => r.ok(senha));
  const confere = confirmar.length > 0 && senha === confirmar;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);

    if (!fd.get("aceite")) {
      setErro("Você precisa aceitar os termos para criar a conta.");
      return;
    }

    if (!senhaForte) {
      setErro("A senha ainda não cumpre todos os requisitos.");
      return;
    }
    if (senha !== confirmar) {
      setErro("A confirmação de senha não confere.");
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
      senha,
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

        <div className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Senha
          </span>
          <div className="relative mt-1.5">
            <input
              name="senha"
              type={verSenha ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Crie uma senha forte"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="hce-input pr-12"
            />
            <BotaoOlho
              aberto={verSenha}
              onToggle={() => setVerSenha((v) => !v)}
              rotulo="senha"
            />
          </div>

          <ul className="mt-3 grid gap-1.5">
            {REGRAS.map((r) => (
              <Requisito key={r.id} ok={senha.length > 0 && r.ok(senha)}>
                {r.label}
              </Requisito>
            ))}
          </ul>
        </div>

        <div className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Confirmar senha
          </span>
          <div className="relative mt-1.5">
            <input
              name="confirmar"
              type={verConfirmar ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Digite a senha novamente"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="hce-input pr-12"
            />
            <BotaoOlho
              aberto={verConfirmar}
              onToggle={() => setVerConfirmar((v) => !v)}
              rotulo="confirmação de senha"
            />
          </div>
          {confirmar.length > 0 &&
            (confere ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckMini /> As senhas conferem.
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-red-600">
                As senhas não conferem.
              </p>
            ))}
        </div>
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
        disabled={enviando || !senhaForte || !confere}
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

// Ícone de "check" pequeno para os requisitos atendidos.
function CheckMini() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}

// Item da lista de requisitos: verde quando cumprido, cinza quando pendente.
function Requisito({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex items-center gap-2 text-sm ${ok ? "text-emerald-700" : "text-muted"}`}
    >
      <span
        aria-hidden
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
          ok ? "bg-emerald-100 text-emerald-700" : "bg-surface-soft text-muted"
        }`}
      >
        {ok ? (
          <CheckMini />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </span>
      {children}
    </li>
  );
}

// Botão "olho" para mostrar/ocultar a senha.
function BotaoOlho({
  aberto,
  onToggle,
  rotulo,
}: {
  aberto: boolean;
  onToggle: () => void;
  rotulo: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={aberto ? `Ocultar ${rotulo}` : `Mostrar ${rotulo}`}
      aria-pressed={aberto}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted transition-colors hover:text-brand-blue"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        {aberto ? (
          <>
            <path d="M3 3l18 18" />
            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
            <path d="M9.4 5.2A9.5 9.5 0 0 1 12 5c5 0 9 4.5 9 7 0 1-.7 2.3-1.9 3.5" />
            <path d="M6.3 6.3C3.9 7.7 3 9.9 3 12c0 2.5 4 7 9 7 1.4 0 2.7-.3 3.8-.9" />
          </>
        ) : (
          <>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </>
        )}
      </svg>
    </button>
  );
}
