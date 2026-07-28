"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  email: string | null;
  emailVerified: boolean;
  // Callback opcional quando a verificação é concluída (ex.: atualizar a tela).
  onVerificado?: () => void;
  // Envia o código automaticamente ao montar (fluxo obrigatório).
  autoEnviar?: boolean;
  // Para onde ir depois de confirmar (fluxo obrigatório de cadastro/login).
  hrefApos?: string;
};

type Fase = "inicio" | "codigo";

function BadgeVerificado() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      </span>
      <div>
        <p className="font-display font-semibold text-emerald-800">
          E-mail verificado
        </p>
        <p className="text-sm text-emerald-700/80">
          Seu e-mail já foi confirmado. Tudo certo!
        </p>
      </div>
    </div>
  );
}

export function VerificarEmail({
  email,
  emailVerified,
  onVerificado,
  autoEnviar,
  hrefApos,
}: Props) {
  const router = useRouter();
  const jaAutoEnviou = useRef(false);
  const [verificado, setVerificado] = useState(emailVerified);
  const [fase, setFase] = useState<Fase>("inicio");
  const [codigo, setCodigo] = useState("");
  const [segundos, setSegundos] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoEnviar && !emailVerified && !jaAutoEnviou.current) {
      jaAutoEnviou.current = true;
      void enviar();
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function concluir() {
    onVerificado?.();
    if (hrefApos) {
      router.push(hrefApos);
    }
    router.refresh();
  }

  function iniciarContagem(seg: number) {
    setSegundos(seg);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function enviar() {
    setErro(null);
    setInfo(null);
    setEnviando(true);
    try {
      const res = await fetch("/api/conta/verificar-email/enviar", {
        method: "POST",
      });
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        alreadyVerified?: boolean;
        expiresInSec?: number;
      };
      if (!res.ok) {
        setErro(d.error || "Não foi possível enviar o código.");
        return;
      }
      if (d.alreadyVerified) {
        setVerificado(true);
        concluir();
        return;
      }
      setFase("codigo");
      setCodigo("");
      setInfo(
        email
          ? `Enviamos um código de 6 dígitos para ${email}.`
          : "Enviamos um código de 6 dígitos para o seu e-mail.",
      );
      iniciarContagem(d.expiresInSec ?? 100);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!/^\d{6}$/.test(codigo)) {
      setErro("Digite os 6 dígitos do código.");
      return;
    }
    setVerificando(true);
    try {
      const res = await fetch("/api/conta/verificar-email/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErro(d.error || "Código inválido.");
        return;
      }
      if (timer.current) clearInterval(timer.current);
      setVerificado(true);
      concluir();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setVerificando(false);
    }
  }

  if (verificado) return <BadgeVerificado />;

  const expirado = fase === "codigo" && segundos === 0;
  const mm = String(Math.floor(segundos / 60)).padStart(1, "0");
  const ss = String(segundos % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-line bg-surface-soft p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-amber/25 text-brand-amber-dark">
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
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="font-display font-semibold text-brand-blue">
            E-mail ainda não verificado
          </p>
          <p className="mt-1 text-sm text-muted">
            Digite o código que enviamos para o seu e-mail. Confirmar é
            necessário para acessar a sua conta.
          </p>
        </div>
      </div>

      {fase === "inicio" && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={enviar}
            disabled={enviando}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-5 font-display text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-blue-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {enviando ? "Enviando código…" : "Enviar código de confirmação"}
          </button>
        </div>
      )}

      {fase === "codigo" && (
        <form onSubmit={confirmar} className="mt-4">
          {info && <p className="text-center text-sm text-ink">{info}</p>}
          <p className="mt-1 text-center text-xs text-muted">
            Não recebeu? Verifique também a caixa de <strong>spam</strong> ou
            lixo eletrônico.
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <input
              value={codigo}
              onChange={(ev) =>
                setCodigo(ev.target.value.replace(/\D/g, "").slice(0, 6))
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              aria-label="Código de 6 dígitos"
              className="hce-input w-40 text-center font-display text-2xl font-bold tracking-[0.4em]"
            />
            <button
              type="submit"
              disabled={verificando || expirado || codigo.length !== 6}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-5 font-display text-sm font-semibold text-brand-blue-deep transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verificando ? "Verificando…" : "Confirmar"}
            </button>
          </div>

          <div className="mt-3 text-center text-sm">
            {expirado ? (
              <div className="flex flex-wrap items-center justify-center gap-2 text-muted">
                <span>O código expirou.</span>
                <button
                  type="button"
                  onClick={enviar}
                  disabled={enviando}
                  className="font-semibold text-brand-blue hover:underline disabled:opacity-60"
                >
                  {enviando ? "Reenviando…" : "Reenviar código"}
                </button>
              </div>
            ) : (
              <p className="text-muted">
                O código expira em{" "}
                <span className="font-semibold text-brand-blue">
                  {mm}:{ss}
                </span>
                .
              </p>
            )}
          </div>
        </form>
      )}

      {erro && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}
    </div>
  );
}
