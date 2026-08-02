import Link from "next/link";
import Image from "next/image";
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
    | "comentarios"
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
    <header className="border-b border-brand-blue-deep bg-gradient-to-r from-brand-blue to-brand-blue-deep text-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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
                    {iniciais}
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
          <Tab
            href="/adm/comentarios"
            label="Comentários"
            active={active === "comentarios"}
          />
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
          ? "bg-brand-amber text-brand-blue-deep"
          : "text-white/85 hover:bg-white/10 hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}
