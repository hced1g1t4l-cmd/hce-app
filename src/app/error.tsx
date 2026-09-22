"use client";

// Error boundary GLOBAL (App Router). Qualquer erro de runtime numa página do
// site (ex.: banco momentaneamente indisponível numa página dinâmica) cai aqui
// e vira uma página amigável — em vez do 500 cru do Next. Mantém a marca e
// oferece "tentar de novo" (reset) e caminhos de saída.
//
// É um Client Component por exigência do Next; por isso é autocontido (sem
// SiteHeader/Footer, que são de servidor) para não misturar as fronteiras.

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registra no console do servidor/cliente para diagnóstico (o Vercel captura).
    console.error("[app/error] erro de runtime:", error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-brand-blue to-brand-blue-deep px-6 py-24 text-center text-white">
      <p className="font-display text-6xl font-extrabold text-brand-amber sm:text-7xl">
        Ops!
      </p>
      <h1 className="font-display text-2xl font-bold text-brand-amber sm:text-3xl">
        Tivemos uma instabilidade momentânea
      </h1>
      <p className="max-w-md text-white/80">
        Não foi possível carregar esta página agora. Pode ser um soluço passageiro
        — tente novamente em instantes. Se persistir, fale com a gente.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="rounded-full bg-brand-amber px-6 py-3 font-semibold text-brand-blue-deep transition hover:brightness-95"
        >
          Tentar de novo
        </button>
        <a
          href="/"
          className="rounded-full border border-brand-amber/70 px-6 py-3 font-semibold text-brand-amber transition hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
        >
          Voltar para o início
        </a>
      </div>
      {error?.digest ? (
        <p className="mt-2 text-xs text-white/40">
          Código de referência: {error.digest}
        </p>
      ) : null}
    </main>
  );
}
