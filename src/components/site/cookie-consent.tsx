"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { lerConsent, salvarConsent } from "@/lib/consent";

// Banner de consentimento de cookies (LGPD). Solução própria, no visual da HCE.
// Peças: (1) banner na 1ª visita, (2) modal "Configurar" com categorias e
// (3) ícone flutuante para reabrir e mudar/retirar o consentimento a qualquer
// momento. A escolha vive no cookie hce_consent (ver lib/consent.ts).

function IconeCookie({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M21 12a9 9 0 1 1-9-9 3 3 0 0 0 3 3 3 3 0 0 0 3 3 3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" />
      <circle cx="12" cy="15" r="1" fill="currentColor" />
      <circle cx="15.5" cy="11.5" r="1" fill="currentColor" />
      <circle cx="8" cy="14.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function Switch({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-brand-blue" : "bg-line",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function CookieConsent() {
  const [montado, setMontado] = useState(false);
  const [banner, setBanner] = useState(false);
  const [modal, setModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setMontado(true);
    const atual = lerConsent();
    if (atual) {
      setAnalytics(atual.analytics);
    } else {
      setBanner(true);
    }
  }, []);

  const fechar = useCallback(() => {
    setModal(false);
    setBanner(false);
  }, []);

  const aceitarTudo = useCallback(() => {
    salvarConsent(true);
    setAnalytics(true);
    fechar();
  }, [fechar]);

  const rejeitar = useCallback(() => {
    salvarConsent(false);
    setAnalytics(false);
    fechar();
  }, [fechar]);

  const salvarPreferencias = useCallback(() => {
    salvarConsent(analytics);
    fechar();
  }, [analytics, fechar]);

  const abrirConfig = useCallback(() => {
    const atual = lerConsent();
    setAnalytics(atual?.analytics ?? false);
    setModal(true);
  }, []);

  // Fecha o modal com Esc.
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  if (!montado) return null;

  const jaDecidiu = !banner;

  return (
    <>
      {/* ÍCONE FLUTUANTE — reabre as preferências (aparece após decidir) */}
      {jaDecidiu && !modal && (
        <button
          type="button"
          onClick={abrirConfig}
          aria-label="Preferências de cookies"
          title="Preferências de cookies"
          className="fixed bottom-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-brand-blue shadow-brand transition-transform hover:scale-105 hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          <IconeCookie className="h-6 w-6" />
        </button>
      )}

      {/* BANNER — 1ª visita */}
      {banner && !modal && (
        <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-brand-lg sm:flex-row sm:items-center sm:p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 hidden text-brand-blue sm:block">
                <IconeCookie className="h-6 w-6" />
              </span>
              <p className="text-sm text-ink">
                Usamos cookies necessários para o site funcionar e, com a sua
                autorização, cookies de estatística para entender o uso e
                melhorar a experiência. Você escolhe.{" "}
                <Link
                  href="/privacidade#cookies"
                  className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-blue-dark"
                >
                  Saiba mais
                </Link>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
              <button
                type="button"
                onClick={rejeitar}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
              >
                Rejeitar
              </button>
              <button
                type="button"
                onClick={abrirConfig}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-brand-blue underline underline-offset-2 transition-colors hover:bg-surface-soft"
              >
                Configurar
              </button>
              <button
                type="button"
                onClick={aceitarTudo}
                className="rounded-full bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-blue-dark"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL — configuração granular */}
      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && jaDecidiu) setModal(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-titulo"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-5 shadow-brand-lg sm:p-6"
          >
            <div className="mb-4 flex items-center gap-2 text-brand-blue">
              <IconeCookie className="h-6 w-6" />
              <h2
                id="cookie-modal-titulo"
                className="font-display text-lg font-bold"
              >
                Preferências de cookies
              </h2>
            </div>

            <p className="mb-4 text-sm text-muted">
              Escolha quais categorias autoriza. Você pode alterar isto quando
              quiser pelo ícone de cookies no canto da tela. Detalhes na{" "}
              <Link
                href="/privacidade#cookies"
                className="font-semibold text-brand-blue underline underline-offset-2"
              >
                política de privacidade
              </Link>
              .
            </p>

            <div className="space-y-3">
              {/* Necessários */}
              <div className="rounded-xl border border-line bg-surface-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">
                      Necessários
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Mantêm o login, a segurança e o funcionamento básico.
                      Sempre ativos — não é possível desativar.
                    </p>
                  </div>
                  <Switch checked disabled label="Necessários (sempre ativos)" />
                </div>
              </div>

              {/* Estatísticas */}
              <div className="rounded-xl border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-ink">
                      Estatísticas
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      Contagem anônima de visitas e cidades para melhorarmos o
                      site. Não usamos publicidade nem rastreio de terceiros.
                    </p>
                  </div>
                  <Switch
                    checked={analytics}
                    onChange={setAnalytics}
                    label="Estatísticas"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={rejeitar}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
              >
                Rejeitar tudo
              </button>
              <button
                type="button"
                onClick={salvarPreferencias}
                className="rounded-full border border-brand-blue px-4 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
              >
                Salvar preferências
              </button>
              <button
                type="button"
                onClick={aceitarTudo}
                className="rounded-full bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition-colors hover:bg-brand-blue-dark"
              >
                Aceitar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
