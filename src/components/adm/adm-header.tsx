import Link from "next/link";
import { cn } from "@/lib/cn";

export function AdmHeader({
  active,
}: {
  active: "leads" | "contatos" | "acessos" | "feed" | "usuarios";
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg font-bold whitespace-nowrap text-brand-blue">
            Painel HCE
          </span>
          <form action="/api/adm/logout" method="post">
            <button
              type="submit"
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
            >
              Sair
            </button>
          </form>
        </div>
        <nav
          aria-label="Seções do painel"
          className="hce-scroll-x -mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-0.5"
        >
          <Tab href="/adm" label="Leads (+HCE)" active={active === "leads"} />
          <Tab
            href="/adm/contatos"
            label="Mensagens"
            active={active === "contatos"}
          />
          <Tab
            href="/adm/acessos"
            label="Acessos"
            active={active === "acessos"}
          />
          <Tab href="/adm/feed" label="Feed HCE" active={active === "feed"} />
          <Tab
            href="/adm/usuarios"
            label="Usuários"
            active={active === "usuarios"}
          />
        </nav>
      </div>
    </header>
  );
}

function Tab({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
        active
          ? "bg-brand-blue text-white"
          : "text-brand-blue hover:bg-surface-soft",
      )}
    >
      {label}
    </Link>
  );
}
