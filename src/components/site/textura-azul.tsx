import { cn } from "@/lib/cn";

// Fator de realce aplicado a TODAS as texturas: deixa a foto um pouco mais
// nítida/visível mantendo o caráter transparente e sutil (BAC_111).
const REALCE = 2.3;

// Textura fotográfica sutil por trás dos blocos azuis (BAC_111). A foto entra
// dessaturada, com um leve contraste e opacidade baixa, só para dar profundidade
// ao azul — sem competir com o conteúdo. O bloco pai precisa ser
// `relative overflow-hidden` e o conteúdo deve ficar acima (Container relative).
export function TexturaAzul({
  src,
  opacidade = 0.1,
  posicao = "center",
  veu = 0.08,
  className,
}: {
  src: string;
  opacidade?: number;
  posicao?: string;
  /** Opacidade do véu azul por cima da foto (0 = sem véu, mais imagem/menos azul). */
  veu?: number;
  className?: string;
}) {
  const op = Math.min(1, opacidade * REALCE);
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover grayscale contrast-150 mix-blend-soft-light"
        style={{ opacity: op, objectPosition: posicao }}
      />
      {/* Véu azul por cima para reforçar a identidade e manter tudo coeso.
          A intensidade é ajustável por instância (veu) — em blocos que já são
          muito azuis, baixar o véu deixa a foto respirar. */}
      {veu > 0 && (
        <div
          className="absolute inset-0 bg-brand-blue mix-blend-multiply"
          style={{ opacity: veu }}
        />
      )}
    </div>
  );
}
