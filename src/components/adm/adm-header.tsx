import Link from "next/link";
import { cn } from "@/lib/cn";

export function AdmHeader({
  active,
}: {
  active: "leads" | "contatos" | "acessos";
}) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg font-bold text-brand-blue">
            Painel HCE
          </span>
          <nav className="flex items-center gap-1">
            <Tab href="/adm" label="Leads (Clube)" active={active === "leads"} />
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
          </nav>
        </div>
        <form action="/api/adm/logout" method="post">
          <button
            type="submit"
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
          >
            Sair
          </button>
        </form>
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
        "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-blue text-white"
          : "text-brand-blue hover:bg-surface-soft",
      )}
    >
      {label}
    </Link>
  );
}
