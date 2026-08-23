"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Curadoria feita no /adm/depoimentos (BAC_137). Os dados chegam por prop a
// partir do banco (model Depoimento); este componente é só a apresentação
// (carrossel de altura fixa + modal com o texto completo).
export type Depoimento = {
  id: string;
  nome: string;
  cargo: string;
  foto: string;
  texto: string;
  formato?: string; // texto | imagem | video (reservado)
};

function Aspas() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-brand-amber"
      fill="currentColor"
    >
      <path d="M9.5 6C6.46 6 4 8.46 4 11.5V18h6v-6H7.2c0-1.55 1.05-2.8 2.3-2.8V6zm10 0C16.46 6 14 8.46 14 11.5V18h6v-6h-2.8c0-1.55 1.05-2.8 2.3-2.8V6z" />
    </svg>
  );
}

function Avatar({ d, tamanho = 14 }: { d: Depoimento; tamanho?: number }) {
  if (!d.foto) {
    const iniciais =
      d.nome
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "?";
    return (
      <span
        aria-hidden
        style={{ width: tamanho * 4, height: tamanho * 4 }}
        className="flex shrink-0 items-center justify-center rounded-full bg-brand-blue font-display font-bold text-brand-amber ring-2 ring-brand-amber/40"
      >
        {iniciais}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={d.foto}
      alt={d.nome}
      loading="lazy"
      style={{ width: tamanho * 4, height: tamanho * 4 }}
      className="shrink-0 rounded-full object-cover object-top ring-2 ring-brand-amber/40"
    />
  );
}

// Card de altura fixa: todos iguais. O texto é limitado (line-clamp) e o
// completo abre num modal, sem perder conteúdo nem quebrar o alinhamento.
function Card({ d, onAbrir }: { d: Depoimento; onAbrir: () => void }) {
  const longo = d.texto.length > 260;
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-brand transition-shadow duration-300 hover:shadow-brand-lg">
      <Aspas />
      <blockquote className="mt-3 line-clamp-6 leading-relaxed whitespace-pre-line text-ink">
        {d.texto}
      </blockquote>
      {longo && (
        <button
          type="button"
          onClick={onAbrir}
          className="mt-2 self-start text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-deep"
        >
          Ler mais
        </button>
      )}
      <figcaption className="mt-auto flex items-center gap-3.5 border-t border-line pt-5">
        <Avatar d={d} />
        <div className="min-w-0">
          <p className="font-display font-bold text-brand-blue">{d.nome}</p>
          <p className="text-sm leading-snug text-muted">{d.cargo}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Seta({ dir }: { dir: "esq" | "dir" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "esq" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export function DepoimentosHome({ depoimentos }: { depoimentos: Depoimento[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(false);
  const [modal, setModal] = useState<Depoimento | null>(null);

  const passo = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const largura = slide?.offsetWidth ?? el.clientWidth;
    return largura + 24; // + gap-6
  }, []);

  const atualizar = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const p = passo() || 1;
    setAtivo(Math.round(el.scrollLeft / p));
    setInicio(el.scrollLeft <= 2);
    setFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, [passo]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    atualizar();
    el.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      el.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, [atualizar]);

  const mover = useCallback(
    (dir: 1 | -1) => {
      scrollerRef.current?.scrollBy({ left: dir * passo(), behavior: "smooth" });
    },
    [passo],
  );

  const irPara = useCallback(
    (i: number) => {
      scrollerRef.current?.scrollTo({ left: i * passo(), behavior: "smooth" });
    },
    [passo],
  );

  // Fecha o modal com Esc.
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  if (depoimentos.length === 0) return null;

  return (
    <div className="mt-14">
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label="Depoimentos"
        className="relative"
      >
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {depoimentos.map((d) => (
            <div
              key={d.id}
              data-slide
              className="h-[23rem] w-full shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <Card d={d} onAbrir={() => setModal(d)} />
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLES */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => mover(-1)}
          disabled={inicio}
          aria-label="Depoimentos anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue shadow-brand transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Seta dir="esq" />
        </button>

        <div className="flex items-center gap-2">
          {depoimentos.map((d, i) => (
            <button
              key={d.id}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o depoimento ${i + 1}`}
              aria-current={ativo === i ? "true" : undefined}
              className={cn(
                "h-2.5 rounded-full transition-all",
                ativo === i
                  ? "w-6 bg-brand-blue"
                  : "w-2.5 bg-line hover:bg-brand-blue/40",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => mover(1)}
          disabled={fim}
          aria-label="Próximos depoimentos"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue shadow-brand transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Seta dir="dir" />
        </button>
      </div>

      {/* MODAL — depoimento completo */}
      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Depoimento de ${modal.nome}`}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-brand-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar d={modal} tamanho={12} />
                <div className="min-w-0">
                  <p className="font-display font-bold text-brand-blue">
                    {modal.nome}
                  </p>
                  <p className="text-sm leading-snug text-muted">
                    {modal.cargo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Fechar"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <Aspas />
            <blockquote className="mt-3 leading-relaxed whitespace-pre-line text-ink">
              {modal.texto}
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
}
