"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const NAV = [
  { label: "Sobre", href: "#sobre" },
  { label: "O que fazemos", href: "#servicos" },
  { label: "Clube +HCE", href: "#clube" },
  { label: "Contato", href: "#contato" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-amber-dark/25 bg-brand-amber/95 backdrop-blur-md">
      <Container className="flex h-20 items-center justify-between py-3">
        {/* FAB_011: logo do topo SEM borda branca e SEM relevo (sombra).
            O proprio quadrado azul da marca ja contrasta com a barra amarela. */}
        <Logo size={44} className="rounded-xl" />

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-brand-blue underline-offset-8 transition-colors duration-300 hover:text-brand-blue-dark hover:underline hover:decoration-2"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="/fale-com-a-hce" size="md" variant="nav">
            Fale com a HCE
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          aria-controls="menu-mobile"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-brand-blue md:hidden"
        >
          <span className="relative flex h-4 w-6 flex-col justify-between">
            <span
              className={cn(
                "h-0.5 w-full rounded bg-current transition-transform",
                open && "translate-y-[7px] rotate-45",
              )}
            />
            <span
              className={cn(
                "h-0.5 w-full rounded bg-current transition-opacity",
                open && "opacity-0",
              )}
            />
            <span
              className={cn(
                "h-0.5 w-full rounded bg-current transition-transform",
                open && "-translate-y-[7px] -rotate-45",
              )}
            />
          </span>
        </button>
      </Container>

      {open && (
        <div id="menu-mobile" className="border-t border-line bg-white md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-surface-soft"
              >
                {item.label}
              </Link>
            ))}
            <Button
              href="/fale-com-a-hce"
              size="lg"
              className="mt-2 w-full"
            >
              Fale com a HCE
            </Button>
          </Container>
        </div>
      )}
    </header>
  );
}
