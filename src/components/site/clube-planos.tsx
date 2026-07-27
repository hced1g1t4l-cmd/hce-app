"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// F1-1: como ainda nao ha meio de pagamento/checkout, qualquer clique em
// "assinar" abre um modal (PiP) avisando que o Clube esta em construcao e leva
// ao formulario /avise-me. Quando o checkout existir, basta trocar o onClick
// dos botoes por um href real.

type Plano = {
  id: string;
  nome: string;
  foco: string;
  precoAnual: string | null; // por mes no plano anual
  precoAvulso: string | null; // avulso por mes
  itens: string[];
  cta: string;
  destaque?: boolean;
};

const PLANOS: Plano[] = [
  {
    id: "gratuito",
    nome: "Gratuito",
    foco: "Atrair",
    precoAnual: null,
    precoAvulso: null,
    itens: [
      "FEED HCE: artigos e conteúdos exclusivos e novidades",
      "FEED HCE: Referências para aprender e aplicar",
    ],
    cta: "Quero começar",
  },
  {
    id: "essencial",
    nome: "Essencial",
    foco: "Aprender",
    precoAnual: "29,90",
    precoAvulso: "34,90",
    itens: [
      "Todos os recursos da versão gratuita",
      "Atualizações semanais de soluções para a cozinha",
      "Leitor online",
    ],
    cta: "Assinar Essencial",
  },
  {
    id: "profissional",
    nome: "Profissional",
    foco: "Aplicar",
    precoAnual: "59,90",
    precoAvulso: "64,90",
    itens: [
      "Tudo do Essencial",
      "Biblioteca de Receitas (novas todo mês)",
      "Download das fichas e receitas em PDF",
    ],
    cta: "Assinar Profissional",
  },
  {
    id: "premium",
    nome: "Premium",
    foco: "Aprofundar",
    precoAnual: "89,90",
    precoAvulso: "94,90",
    itens: [
      "Tudo do Profissional",
      "E-books e materiais exclusivos",
      "Contato com especialistas",
      "Comunidade premium",
    ],
    cta: "Assinar Premium",
    destaque: true,
  },
];

const ctaBase =
  "mt-8 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center font-display text-sm font-semibold leading-snug shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:text-base";

export function ClubePlanos() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  function openModal() {
    if (typeof document !== "undefined") {
      lastFocus.current = document.activeElement as HTMLElement;
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open]);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {PLANOS.map((p) => (
          <article
            key={p.id}
            className={cn(
              "reveal relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none",
              p.destaque
                ? "border-brand-amber ring-2 ring-brand-amber/60"
                : "border-line hover:border-brand-amber",
            )}
          >
            {p.destaque && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber px-4 py-1 font-display text-xs font-bold tracking-wide text-brand-blue-deep uppercase">
                Mais completo
              </span>
            )}

            <span className="font-display text-xs font-semibold tracking-widest text-brand-amber-dark uppercase">
              {p.foco}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-brand-blue">
              {p.nome}
            </h3>

            <div className="mt-5 min-h-[76px]">
              {p.precoAnual ? (
                <>
                  <p className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-brand-blue">
                      R$ {p.precoAnual}
                    </span>
                    <span className="text-sm font-medium text-muted">/mês</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    no plano anual · ou R$ {p.precoAvulso} avulso
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-4xl font-extrabold text-brand-blue">
                    Grátis
                  </p>
                  <p className="mt-1 text-sm text-muted">para sempre</p>
                </>
              )}
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-ink">
              {p.itens.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-amber text-xs font-bold text-brand-blue-deep"
                  >
                    ✓
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={openModal}
              className={cn(
                ctaBase,
                p.destaque
                  ? "bg-brand-amber text-brand-blue-deep hover:bg-brand-amber-dark"
                  : "bg-brand-blue text-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep",
              )}
            >
              {p.cta}
            </button>
          </article>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-brand-blue-deep/70 backdrop-blur-sm"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clube-construcao-title"
            aria-describedby="clube-construcao-desc"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar aviso"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            <span className="inline-flex items-center gap-2 rounded-full bg-brand-amber-soft px-3 py-1 font-display text-xs font-bold tracking-wide text-brand-amber-dark uppercase">
              Em construção
            </span>

            <h2
              id="clube-construcao-title"
              className="mt-4 font-display text-2xl font-bold text-brand-blue"
            >
              O Clube +HCE está chegando
            </h2>
            <p
              id="clube-construcao-desc"
              className="mt-3 text-sm leading-relaxed text-muted"
            >
              Estamos preparando tudo com muito cuidado. Em breve o{" "}
              <strong className="text-brand-blue">Clube +HCE</strong> estará no
              ar, com acervo, receitas, e-books e comunidade. Quer ser o primeiro
              a saber quando lançar?
            </p>

            <div className="mt-7">
              <Button href="/avise-me" size="lg" className="w-full">
                Quero ser avisado do lançamento
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-brand-blue hover:underline"
            >
              Agora não
            </button>
          </div>
        </div>
      )}
    </>
  );
}
