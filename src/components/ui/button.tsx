import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "blue" | "nav";
type Size = "md" | "lg";

// FAB_004: transicao mais longa ("esfumacar") e padrao azul<->amarelo.
// Todos os botoes convergem para AMARELO no hover.
// RAF_002: texto sempre centralizado (inclusive quando quebra em 2 linhas).
const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-center leading-snug font-display font-semibold transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

// FAB_009: regra de cor dos botoes
//  - fundo AMARELO  => letra AZUL
//  - fundo AZUL     => letra AMARELA
// FAB_004: no hover o botao "esfumaca" trocando de cor (blue <-> amber).
const variants: Record<Variant, string> = {
  // Fundo amarelo, letra azul. Hover: escurece o amarelo (mantem letra azul).
  primary:
    "bg-brand-amber text-brand-blue-deep hover:bg-brand-amber-dark hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-brand-amber",
  // Contorno em superficie escura: letra amarela; hover vira fundo amarelo com letra azul.
  secondary:
    "border border-current text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep focus-visible:outline-brand-amber",
  ghost:
    "text-brand-blue hover:bg-brand-amber hover:text-brand-blue-deep focus-visible:outline-brand-amber",
  // Fundo azul, letra amarela. Hover: vira amarelo com letra azul.
  blue: "bg-brand-blue text-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-brand-amber",
  // CTA sobre a barra amarela: fundo azul, letra amarela. Hover escurece o azul
  // (nao vira amarelo, senao sumiria no header amarelo).
  nav: "bg-brand-blue text-brand-amber hover:bg-brand-blue-dark hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-brand-amber",
};

// RAF_002: tamanhos responsivos — menores no mobile, cheios no desktop.
const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm sm:px-5",
  lg: "px-6 py-3 text-sm sm:px-7 sm:py-3.5 sm:text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

// Como link interno/externo (padrao) ou como <button> quando passthrought onClick.
export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & {
  href: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const external = href.startsWith("http") || href.startsWith("mailto:");

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
