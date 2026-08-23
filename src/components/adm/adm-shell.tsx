"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type AdminInfo = { nome: string; fotoUrl: string | null } | null;
type OnlineAdmin = { id: string; nome: string; fotoUrl: string | null };

type ItemNav = { href: string; label: string; exact?: boolean };
type GrupoNav = { titulo: string; itens: ItemNav[] };

// Menu do painel organizado por macro-temas (cada tema com suas aberturas).
const GRUPOS: GrupoNav[] = [
  {
    titulo: "Visão geral",
    itens: [{ href: "/adm/home", label: "Início" }],
  },
  {
    titulo: "Conteúdo",
    itens: [
      { href: "/adm/feed", label: "Feed HCE" },
      { href: "/adm/comentarios", label: "Comentários" },
      { href: "/adm/depoimentos", label: "Depoimentos" },
      { href: "/adm/na-midia", label: "Na Mídia" },
      { href: "/adm/midia", label: "Biblioteca" },
    ],
  },
  {
    titulo: "Público & Leads",
    itens: [
      { href: "/adm", label: "Leads (+HCE)", exact: true },
      { href: "/adm/contatos", label: "Mensagens" },
      { href: "/adm/usuarios", label: "Usuários" },
    ],
  },
  {
    titulo: "Métricas",
    itens: [
      { href: "/adm/acessos", label: "Acessos" },
      { href: "/adm/metricas", label: "Métricas Feed" },
    ],
  },
  {
    titulo: "Administração",
    itens: [
      { href: "/adm/backlog", label: "Backlog" },
      { href: "/adm/admins", label: "Admins" },
      { href: "/adm/logs", label: "Logs" },
      { href: "/adm/conta", label: "Minha conta" },
    ],
  },
];

// Rotas de autenticação: não mostram o shell (topo + menu lateral).
const AUTH_ROUTES = [
  "/adm/login",
  "/adm/esqueci-senha",
  "/adm/redefinir-senha",
  "/adm/trocar-senha",
];

function iniciaisDe(nome: string): string {
  return (
    nome
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function AdmShell({
  admin,
  online,
  children,
}: {
  admin: AdminInfo;
  online: OnlineAdmin[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAuth = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  const [mobileOpen, setMobileOpen] = useState(false);
  const [fechados, setFechados] = useState<Set<string>>(new Set());

  // Telas de login/senha: renderiza o conteúdo puro, sem cromo do painel.
  if (isAuth) return <>{children}</>;

  function ativo(item: ItemNav): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  function toggleGrupo(titulo: string) {
    setFechados((prev) => {
      const n = new Set(prev);
      if (n.has(titulo)) n.delete(titulo);
      else n.add(titulo);
      return n;
    });
  }

  const nav = (
    <nav aria-label="Seções do painel" className="space-y-5 p-4">
      {GRUPOS.map((g) => {
        const aberto = !fechados.has(g.titulo);
        return (
          <div key={g.titulo}>
            <button
              type="button"
              onClick={() => toggleGrupo(g.titulo)}
              aria-expanded={aberto}
              className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-[11px] font-bold tracking-wider text-muted uppercase transition-colors hover:text-ink"
            >
              <span>{g.titulo}</span>
              <svg
                viewBox="0 0 20 20"
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  aberto ? "rotate-90" : "rotate-0",
                )}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 5l6 5-6 5" />
              </svg>
            </button>
            {aberto && (
              <ul className="mt-1 space-y-0.5">
                {g.itens.map((item) => {
                  const on = ativo(item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={on ? "page" : undefined}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                          on
                            ? "bg-brand-blue text-white shadow-sm"
                            : "text-ink/80 hover:bg-surface-soft hover:text-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface-soft">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 border-b border-brand-blue-deep bg-gradient-to-r from-brand-blue to-brand-blue-deep text-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10 lg:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a
              href="https://www.hcegastronomia.com"
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir o site da HCE em nova aba"
              aria-label="Abrir o site da HCE em nova aba"
              className="inline-flex shrink-0 rounded-xl ring-1 ring-white/15 transition-transform hover:scale-105"
            >
              <Image
                src="/brand/logos/logo-1x1.png"
                alt="HCE"
                width={40}
                height={40}
                className="h-10 w-10 rounded-xl"
                priority
              />
            </a>
            <span className="font-display text-lg font-bold whitespace-nowrap text-brand-amber">
              Painel ADM
            </span>
          </div>
          <div className="flex items-center gap-3">
            {online.length > 0 && (
              <div
                className="hidden items-center gap-2 sm:flex"
                aria-label={`Admins online agora: ${online
                  .map((a) => a.nome)
                  .join(", ")}`}
                title={`Online agora: ${online.map((a) => a.nome).join(", ")}`}
              >
                <span className="hidden text-xs font-semibold text-white/70 md:inline">
                  Online
                </span>
                <div className="flex -space-x-2">
                  {online.slice(0, 5).map((a) => (
                    <span key={a.id} className="relative inline-flex">
                      {a.fotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={a.fotoUrl}
                          alt={a.nome}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-brand-blue-deep"
                        />
                      ) : (
                        <span
                          title={a.nome}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white ring-2 ring-brand-blue-deep"
                        >
                          {iniciaisDe(a.nome)}
                        </span>
                      )}
                      <span className="absolute right-0 bottom-0 h-2 w-2 rounded-full bg-green-400 ring-2 ring-brand-blue-deep" />
                    </span>
                  ))}
                  {online.length > 5 && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white ring-2 ring-brand-blue-deep">
                      +{online.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
            {admin && (
              <Link
                href="/adm/conta"
                className="flex items-center gap-2 rounded-full border border-white/30 py-1 pr-3 pl-1 transition-colors hover:bg-white/10"
                title="Minha conta"
              >
                {admin.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={admin.fotoUrl}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                    {iniciaisDe(admin.nome)}
                  </span>
                )}
                <span className="hidden text-sm font-semibold text-white sm:inline">
                  {admin.nome}
                </span>
              </Link>
            )}
            <form action="/api/adm/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex items-start">
        {/* Menu lateral (desktop) */}
        <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 overflow-y-auto border-r border-line bg-white lg:block">
          {nav}
        </aside>

        {/* Conteúdo da página */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {/* Menu lateral (mobile — drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="absolute top-0 left-0 flex h-full w-72 max-w-[85%] flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-base font-bold text-brand-blue">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </div>
  );
}
