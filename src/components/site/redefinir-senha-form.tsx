"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Mesmas regras da criação de conta. Cada uma vira um "verdinho" ao vivo.
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

export function RedefinirSenhaForm({ token }: { token: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const senhaForte = REGRAS.every((r) => r.ok(senha));
  const confere = confirmar.length > 0 && senha === confirmar;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);

    if (!senhaForte) {
      setErro("A senha ainda não cumpre todos os requisitos.");
      return;
    }
    if (senha !== confirmar) {
      setErro("A confirmação de senha não confere.");
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
        <div className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Nova senha
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
            Confirmar nova senha
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

      {erro && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || !senhaForte || !confere}
        className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand-blue px-6 py-3 text-center font-display text-base font-semibold text-brand-amber transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Salvando…" : "Redefinir senha"}
      </button>
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
