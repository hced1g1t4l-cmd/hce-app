"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArtigoCard, type FeedItem } from "./feed-artigo-card";

// Carrossel do Feed (mobile): o artigo mais recente já aparece com foto e
// texto; botões e arraste levam para os próximos, de um lado para o outro.
export function FeedCarrossel({
  items,
  className,
}: {
  items: FeedItem[];
  className?: string;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);

  const irPara = useCallback((i: number) => {
    const el = trilhoRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const passo = card ? card.offsetWidth + 16 : el.clientWidth;
    el.scrollTo({ left: passo * i, behavior: "smooth" });
  }, []);

  const mover = (dir: number) => {
    const alvo = Math.min(items.length - 1, Math.max(0, ativo + dir));
    irPara(alvo);
  };

  // Atualiza o indicador conforme rola
  useEffect(() => {
    const el = trilhoRef.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.querySelector<HTMLElement>("[data-card]");
      const passo = card ? card.offsetWidth + 16 : el.clientWidth;
      setAtivo(Math.round(el.scrollLeft / passo));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={trilhoRef}
          className="hce-sem-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {items.map((it) => (
            <div
              key={it.id}
              data-card
              className="w-[86%] shrink-0 snap-center"
            >
              <ArtigoCard item={it} />
            </div>
          ))}
        </div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              disabled={ativo === 0}
              aria-label="Artigo anterior"
              className="absolute top-[28%] left-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-blue shadow-lg ring-1 ring-line transition disabled:opacity-0"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              disabled={ativo >= items.length - 1}
              aria-label="Próximo artigo"
              className="absolute top-[28%] right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-blue shadow-lg ring-1 ring-line transition disabled:opacity-0"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o artigo ${i + 1}`}
              className={
                "h-2 rounded-full transition-all " +
                (i === ativo
                  ? "w-6 bg-brand-blue"
                  : "w-2 bg-brand-blue/25 hover:bg-brand-blue/40")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
