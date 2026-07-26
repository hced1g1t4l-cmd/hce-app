import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "blue";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Botao principal: ambar sobre azul/branco, cor de acao da marca.
  primary:
    "bg-brand-amber text-brand-blue-deep hover:bg-brand-amber-dark hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-brand-amber",
  // Secundario: contorno para superficies claras ou escuras.
  secondary:
    "border border-current text-brand-blue hover:bg-brand-blue hover:text-white focus-visible:outline-brand-blue",
  ghost: "text-brand-blue hover:bg-brand-blue/5 focus-visible:outline-brand-blue",
  // Azul solido: bom para superficies claras/ambar (ex.: header amarelo).
  blue: "bg-brand-blue text-white hover:bg-brand-blue-dark hover:-translate-y-0.5 shadow-sm hover:shadow-md focus-visible:outline-brand-blue",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
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
