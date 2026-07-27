"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

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
  const backRef = useRef<HTMLDivElement>(null);
  // So aplicamos o "hover vira" em aparelhos com mouse fino (evita hover fantasma no toque).
  const hoverCapable = useRef(false);

  useEffect(() => {
    hoverCapable.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
  }, []);

  // RAF_006: a bio deve sempre reabrir do topo. Reseta a rolagem do verso.
  const resetBioScroll = () => {
    if (backRef.current) backRef.current.scrollTop = 0;
  };

  const virar = (valor: boolean) => {
    if (valor) resetBioScroll(); // reseta so ao ABRIR, evitando pulo ao fechar
    setFlipped(valor);
  };

  const toggle = () => virar(!flipped);

  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-surface-soft">
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
          {/* Frente: foto */}
          <div className="flip-card-face overflow-hidden">
            <Image
              src={foto}
              alt={`${nome}, ${papel} da HCE`}
              fill
              sizes="(max-width: 768px) 45vw, 300px"
              className="object-cover"
              style={{ objectPosition: fotoPos }}
            />
            <span className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-brand-blue/85 px-2.5 py-1 text-[0.7rem] font-semibold text-white backdrop-blur-sm">
              <span aria-hidden>↻</span> bio
            </span>
          </div>
          {/* Verso: mini bio (rola e comeca do topo) */}
          <div
            ref={backRef}
            className="flip-card-face flip-card-back flex flex-col items-start justify-start gap-2 overflow-y-auto bg-brand-blue p-5 text-left text-white"
          >
            <p className="font-display text-base font-semibold text-brand-amber">
              {nome}
            </p>
            <p className="text-[0.82rem] leading-relaxed text-white/90">{bio}</p>
            <span className="mt-auto pt-2 text-[0.68rem] text-white/55">
              toque para voltar
            </span>
          </div>
        </div>
      </div>
      <figcaption className="p-4">
        <p className="font-display font-semibold text-brand-blue">{nome}</p>
        <p className="text-sm text-muted">{papel}</p>
      </figcaption>
    </figure>
  );
}
