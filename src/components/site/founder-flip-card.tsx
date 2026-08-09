"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Rotate } from "@/components/ui/icons";

// Card das fundadoras com flip.
//  - Desktop: vira ao passar o mouse (via JS, para nao conflitar com o clique).
//  - Mobile/desktop: clique/toque vira; clicar de novo volta para a foto (RAF_003).
//  - O verso rola (overflow) e comeca do topo, para bios longas caberem.
export function FounderFlipCard({
  nome,
  papel,
  foto,
  bio,
  fotoPos = "center",
}: {
  nome: string;
  papel: string;
  foto: string;
  bio: string;
  fotoPos?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  // FAB_016: indica que a bio rola. Some ao chegar no fim.
  const [temMais, setTemMais] = useState(false);
  const backRef = useRef<HTMLDivElement>(null);
  // So aplicamos o "hover vira" em aparelhos com mouse fino (evita hover fantasma no toque).
  const hoverCapable = useRef(false);

  useEffect(() => {
    hoverCapable.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
  }, []);

  // Mostra a seta quando ha conteudo abaixo e ainda nao chegou no fim.
  const atualizarSeta = () => {
    const el = backRef.current;
    if (!el) return;
    const podeRolar = el.scrollHeight - el.clientHeight > 4;
    const noFim = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setTemMais(podeRolar && !noFim);
  };

  // RAF_006: a bio deve sempre reabrir do topo. Reseta a rolagem do verso.
  const resetBioScroll = () => {
    if (backRef.current) backRef.current.scrollTop = 0;
  };

  const virar = (valor: boolean) => {
    if (valor) {
      resetBioScroll(); // reseta so ao ABRIR, evitando pulo ao fechar
      setTimeout(atualizarSeta, 60); // apos o layout do verso
    } else {
      setTemMais(false);
    }
    setFlipped(valor);
  };

  const toggle = () => virar(!flipped);

  return (
    <figure className="reveal overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-brand transition-shadow duration-300 hover:shadow-brand-lg">
      <div
        className="flip-card relative aspect-square w-full cursor-pointer outline-none"
        tabIndex={0}
        role="button"
        aria-pressed={flipped}
        aria-label={`${nome} — ${flipped ? "voltar para a foto" : "ver mini bio"}`}
        onClick={toggle}
        onMouseEnter={() => hoverCapable.current && virar(true)}
        onMouseLeave={() => hoverCapable.current && virar(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className={cn("flip-card-inner", flipped && "is-flipped")}>
          {/* Frente: foto (fundo levemente tingido de âmbar para integrar à marca) */}
          <div className="flip-card-face overflow-hidden bg-gradient-to-b from-brand-amber-soft/40 to-surface-soft">
            <Image
              src={foto}
              alt={`${nome}, ${papel} da HCE`}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
              className="object-cover"
              style={{ objectPosition: fotoPos }}
            />
            <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-brand-blue/90 px-3 py-1.5 text-[0.72rem] font-semibold text-white shadow-brand ring-1 ring-white/15 backdrop-blur-sm">
              <Rotate className="h-3.5 w-3.5 text-brand-amber" /> bio
            </span>
          </div>
          {/* Verso: mini bio (rola e comeca do topo) */}
          <div className="flip-card-face flip-card-back relative bg-brand-blue text-left text-white">
            <div
              ref={backRef}
              onScroll={atualizarSeta}
              className="flex h-full flex-col items-start justify-start gap-2 overflow-y-auto p-5"
            >
              <p className="font-serif text-lg font-semibold text-brand-amber">
                {nome}
              </p>
              <p className="text-[0.82rem] leading-relaxed text-white/90">
                {bio}
              </p>
            </div>
            {/* FAB_016: seta indicando que da para rolar (some no fim) */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-brand-blue via-brand-blue/80 to-transparent pt-8 pb-2 transition-opacity duration-300",
                temMais ? "opacity-100" : "opacity-0",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hce-scroll-nudge h-5 w-5 text-brand-amber"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="p-4">
        <p className="font-serif text-lg font-semibold text-brand-blue">
          {nome}
        </p>
        <p className="text-sm text-muted">{papel}</p>
      </figcaption>
    </figure>
  );
}
