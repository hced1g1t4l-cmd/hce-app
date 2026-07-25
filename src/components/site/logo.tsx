import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

// Logo da HCE. "badge" = simbolo quadrado azul (bom em fundo claro).
// "light" = versao ambar transparente (para fundos escuros/azul).
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
  const src =
    variant === "badge"
      ? "/brand/logos/logo-1x1.png"
      : "/brand/logos/logo-hce.png";

  const img = (
    <Image
      src={src}
      alt="HCE — Hospitalidade, Consultoria e Educação em Gastronomia"
      width={variant === "badge" ? size : size * 2.4}
      height={size}
      className={cn(
        variant === "badge" && "rounded-xl",
        "h-auto w-auto",
        className,
      )}
      style={{ height: size }}
      priority
    />
  );

  if (href === null) return img;

  return (
    <Link href={href} aria-label="HCE — página inicial" className="inline-flex">
      {img}
    </Link>
  );
}
