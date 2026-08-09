import type { SVGProps } from "react";

// Conjunto único de ícones em SVG (traço 2px, cantos arredondados) para
// substituir glifos de texto (✓, ↻) por formas nítidas e consistentes.

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Base>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Base>
  );
}

export function Rotate(props: IconProps) {
  return (
    <Base {...props} strokeWidth={2.2}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v4h4" />
    </Base>
  );
}
