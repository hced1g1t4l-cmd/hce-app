"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type ContaEstado = { nome: string | null } | null | undefined;

const NAV = [
  { label: "Sobre", href: "/quem-somos" },
  { label: "O que fazemos", href: "/servicos" },
  { label: "Feed", href: "/feed" },
  { label: "+HCE", href: "/clube" },
  { label: "Contato", href: "/#contato" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  // undefined = carregando; null = deslogado; objeto = logado.
  const [conta, setConta] = useState<ContaEstado>(undefined);
  // Header "consciente do scroll": encolhe e ganha sombra ao rolar.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let vivo = true;
    fetch("/api/conta/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d: { user: { nome: string | null } | null }) => {
        if (vivo) setConta(d.user);
      })
      .catch(() => {
        if (vivo) setConta(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-brand-amber/90 backdrop-blur-md transition-shadow duration-300",
        scrolled
          ? "border-b border-brand-amber-dark/20 shadow-brand"
          : "border-b border-transparent",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-[height] duration-300",
          scrolled ? "h-14" : "h-20",
        )}
      >
        {/* FAB_011: logo do topo SEM borda branca e SEM relevo (sombra).
            O proprio quadrado azul da marca ja contrasta com a barra amarela. */}
        <Logo
          size={44}
          className={cn(
            "rounded-xl transition-transform duration-300",
            scrolled && "scale-90",
          )}
        />

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

        <div className="hidden items-center gap-5 md:flex">
          {conta === null && (
            <Link
              href="/entrar"
              className="text-sm font-semibold text-brand-blue underline-offset-8 transition-colors duration-300 hover:text-brand-blue-dark hover:underline hover:decoration-2"
            >
              Entrar
            </Link>
          )}
          {conta && (
            <Link
              href="/conta"
              className="text-sm font-semibold text-brand-blue underline-offset-8 transition-colors duration-300 hover:text-brand-blue-dark hover:underline hover:decoration-2"
            >
              Minha conta
            </Link>
          )}
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
            <Link
              href={conta ? "/conta" : "/entrar"}
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-base font-semibold text-brand-blue hover:bg-surface-soft"
            >
              {conta ? "Minha conta" : "Entrar / Criar conta"}
            </Link>
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
