import Link from "next/link";
import { cn } from "@/lib/cn";
import { getAdmin } from "@/lib/adm";

export async function AdmHeader({
  active,
}: {
  active:
    | "leads"
    | "contatos"
    | "acessos"
    | "feed"
    | "midia"
    | "usuarios"
    | "admins"
    | "logs"
    | "conta";
}) {
  const admin = await getAdmin();
  const iniciais = admin?.nome
    ? admin.nome
        .trim()
        .split(/\s+/)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <span className="font-display text-lg font-bold whitespace-nowrap text-brand-blue">
            Painel HCE
          </span>
          <div className="flex items-center gap-3">
            {admin && (
              <Link
                href="/adm/conta"
                className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1 transition-colors hover:bg-surface-soft"
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
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                    {iniciais}
                  </span>
                )}
                <span className="hidden text-sm font-semibold text-brand-blue sm:inline">
                  {admin.nome}
                </span>
              </Link>
            )}
            <form action="/api/adm/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
              >
                Sair
              </button>
            </form>
          </div>
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
          <Tab href="/adm/acessos" label="Acessos" active={active === "acessos"} />
          <Tab href="/adm/feed" label="Feed HCE" active={active === "feed"} />
          <Tab href="/adm/midia" label="Mídia" active={active === "midia"} />
          <Tab
            href="/adm/usuarios"
            label="Usuários"
            active={active === "usuarios"}
          />
          <Tab href="/adm/admins" label="Admins" active={active === "admins"} />
          <Tab href="/adm/logs" label="Logs" active={active === "logs"} />
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
