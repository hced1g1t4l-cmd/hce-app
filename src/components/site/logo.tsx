import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

// Logo da HCE. "badge" = simbolo quadrado azul (bom em fundo claro).
// "light" = versao ambar transparente (para fundos escuros/azul).
//
// No badge, o "cabo" da frigideirinha e uma camada separada (logo-handle.png)
// sobreposta ao logo sem cabo (logo-1x1-base.png). Ao passar o mouse, so o
// cabo balanca sutilmente, girando pelo ponto onde encontra a panela.
export function Logo({
  variant = "badge",
  className,
  href = "/",
  size = 44,
}: {
  variant?: "badge" | "light";
  className?: string;
  href?: string | null;
  size?: number;
}) {
  const wrap = (inner: React.ReactNode) =>
    href === null ? (
      inner
    ) : (
      <Link
        href={href}
        aria-label="HCE — página inicial"
        className="inline-flex"
      >
        {inner}
      </Link>
    );

  if (variant === "badge") {
    return wrap(
      <span
        className={cn(
          "hce-logo relative inline-block overflow-hidden rounded-xl",
          className,
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src="/brand/logos/logo-1x1-base.png"
          alt="HCE — Hospitalidade, Consultoria e Educação em Gastronomia"
          width={size}
          height={size}
          className="h-full w-full"
          priority
        />
        {/* Cabo da frigideirinha (camada animada no hover) */}
        <Image
          src="/brand/logos/logo-handle.png"
          alt=""
          aria-hidden
          width={142}
          height={159}
          className="hce-logo-handle pointer-events-none absolute"
          style={{
            left: "53.7%",
            top: "29.63%",
            width: "13.15%",
            height: "14.72%",
          }}
          priority
        />
      </span>,
    );
  }

  return wrap(
    <Image
      src="/brand/logos/logo-hce.png"
      alt="HCE — Hospitalidade, Consultoria e Educação em Gastronomia"
      width={size * 2.4}
      height={size}
      className={cn("h-auto w-auto", className)}
      style={{ height: size }}
      priority
    />,
  );
}
