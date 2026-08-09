import { cn } from "@/lib/cn";

// Textura fotográfica sutil por trás dos blocos azuis (BAC_111). A foto entra
// dessaturada, com blend suave e opacidade baixa, só para dar profundidade ao
// azul — sem competir com o conteúdo. O bloco pai precisa ser
// `relative overflow-hidden` e o conteúdo deve ficar acima (Container relative).
export function TexturaAzul({
  src,
  opacidade = 0.1,
  posicao = "center",
  className,
}: {
  src: string;
  opacidade?: number;
  posicao?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover grayscale mix-blend-soft-light"
        style={{ opacity: opacidade, objectPosition: posicao }}
      />
      {/* Véu azul por cima para reforçar a identidade e manter tudo coeso. */}
      <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply" />
    </div>
  );
}
