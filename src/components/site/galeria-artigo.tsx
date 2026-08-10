"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Carrossel de fotos do artigo, "a partir da capa": o primeiro slide é a
// capa e os demais são as fotos extras da galeria. Usado na matéria pública
// e no preview do editor.
export function GaleriaArtigo({
  capa,
  galeria,
  creditos,
  titulo,
}: {
  capa?: string | null;
  galeria?: string[] | null;
  // Fonte/crédito alinhado por índice a [capa, ...galeria].
  creditos?: (string | null)[] | null;
  titulo: string;
}) {
  // Pareia URL + crédito e filtra as vazias mantendo o alinhamento.
  const itens = [capa, ...(galeria ?? [])]
    .map((u, i) => ({
      url: (u ?? "").trim(),
      credito: (creditos?.[i] ?? "").trim(),
    }))
    .filter((it) => it.url);
  const fotos = itens.map((it) => it.url);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);

  const irPara = useCallback((i: number) => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const alvo = trilho.children[i] as HTMLElement | undefined;
    if (alvo) trilho.scrollTo({ left: alvo.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    const onScroll = () => {
      const largura = trilho.clientWidth || 1;
      setAtivo(Math.round(trilho.scrollLeft / largura));
    };
    trilho.addEventListener("scroll", onScroll, { passive: true });
    return () => trilho.removeEventListener("scroll", onScroll);
  }, []);

  if (fotos.length === 0) return null;

  // Uma única foto: mantém o comportamento original (imagem estática).
  if (fotos.length === 1) {
    return (
      <figure className="-mt-8 sm:-mt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotos[0]}
          alt={titulo}
          className="aspect-video w-full rounded-2xl border border-line object-cover shadow-lg"
        />
        {itens[0].credito && (
          <figcaption className="mt-2 text-xs text-muted italic">
            {itens[0].credito}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <>
      <div className="relative -mt-8 sm:-mt-10">
      <div
        ref={trilhoRef}
        className="hce-sem-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-line shadow-lg"
      >
        {fotos.map((url, i) => (
          <div key={`${url}-${i}`} className="w-full shrink-0 snap-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={i === 0 ? titulo : `${titulo} — foto ${i + 1}`}
              className="aspect-video w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Botões anterior / próximo */}
      {ativo > 0 && (
        <button
          type="button"
          aria-label="Foto anterior"
          onClick={() => irPara(ativo - 1)}
          className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-blue shadow-md transition-colors hover:bg-white"
        >
          ←
        </button>
      )}
      {ativo < fotos.length - 1 && (
        <button
          type="button"
          aria-label="Próxima foto"
          onClick={() => irPara(ativo + 1)}
          className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-blue shadow-md transition-colors hover:bg-white"
        >
          →
        </button>
      )}

      {/* Indicadores */}
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
        {fotos.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Ir para a foto ${i + 1}`}
            onClick={() => irPara(i)}
            className={
              "h-2 rounded-full transition-all " +
              (i === ativo ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/80")
            }
          />
        ))}
      </div>
      </div>
      {itens[ativo]?.credito && (
        <p className="mt-2 text-xs text-muted italic">{itens[ativo].credito}</p>
      )}
    </>
  );
}
