import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import { UsuariosTabela } from "@/components/adm/usuarios-tabela";
import { formatarEndereco } from "@/lib/localidades";
import { capitalizarNome } from "@/lib/nome";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// Consideramos "online" quem navegou logado nos ultimos 15 min (o ultimoAcesso
// e gravado com janela de ~10 min).
const JANELA_ONLINE_MS = 15 * 60 * 1000;

function iniciaisDe(nome: string | null, email: string | null): string {
  const base = (nome || email || "?").trim();
  const partes = base.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const ini =
    (partes[0]?.[0] ?? "") +
    (partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "");
  return ini.toUpperCase() || "?";
}

export default async function AdmUsuariosPage() {
  const sessaoAdm = await getAdmin();
  if (!sessaoAdm) redirect("/adm/login");
  if (sessaoAdm.precisaTrocarSenha) redirect("/adm/trocar-senha");

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      plano: true,
      aceitaComunicacoes: true,
      createdAt: true,
      ultimoAcesso: true,
      image: true,
      bio: true,
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      pais: true,
      linkedin: true,
      instagram: true,
      facebook: true,
    },
  });

  const usuarios = rows.map((u) => ({
    id: u.id,
    name: capitalizarNome(u.name),
    email: u.email,
    telefone: u.telefone,
    plano: u.plano,
    aceitaComunicacoes: u.aceitaComunicacoes,
    cadastro: fmt.format(u.createdAt),
    ultimoAcesso: u.ultimoAcesso ? fmt.format(u.ultimoAcesso) : null,
    onlineAgora: u.ultimoAcesso
      ? Date.now() - u.ultimoAcesso.getTime() < JANELA_ONLINE_MS
      : false,
    image: u.image,
    bio: u.bio,
    endereco: formatarEndereco(u) || null,
    linkedin: u.linkedin,
    instagram: u.instagram,
    facebook: u.facebook,
  }));

  const optIn = usuarios.filter((u) => u.aceitaComunicacoes).length;
  const online = usuarios.filter((u) => u.onlineAgora);

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="usuarios" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Usuários · Contas do site
          </h1>
          <p className="text-sm text-muted">
            {usuarios.length} {usuarios.length === 1 ? "conta" : "contas"} ·{" "}
            {optIn} aceitam comunicações · clique numa linha para ver o perfil
          </p>
        </div>

        {/* ONLINE AGORA */}
        <section className="mb-5 rounded-xl border border-line bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={
                  "absolute inline-flex h-full w-full rounded-full " +
                  (online.length > 0
                    ? "animate-ping bg-green-400 opacity-75"
                    : "bg-transparent")
                }
              />
              <span
                className={
                  "relative inline-flex h-2.5 w-2.5 rounded-full " +
                  (online.length > 0 ? "bg-green-500" : "bg-line")
                }
              />
            </span>
            <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
              Online agora
            </h2>
            <span className="text-sm text-muted">
              ({online.length}{" "}
              {online.length === 1 ? "pessoa" : "pessoas"})
            </span>
          </div>

          {online.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Ninguém navegando no site neste momento.
            </p>
          ) : (
            <ul className="mt-3 flex flex-wrap gap-3">
              {online.map((u) => (
                <li
                  key={u.id}
                  title={`${u.name || u.email || "Usuário"}${
                    u.ultimoAcesso ? ` · último acesso ${u.ultimoAcesso}` : ""
                  }`}
                  className="flex items-center gap-2 rounded-full border border-line py-1 pr-3 pl-1"
                >
                  <span className="relative">
                    {u.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.image}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                        {iniciaisDe(u.name, u.email)}
                      </span>
                    )}
                    <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                  </span>
                  <span className="max-w-[10rem] truncate text-sm font-semibold text-ink">
                    {u.name || u.email || "Usuário"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {usuarios.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
            Nenhuma conta criada ainda.
          </p>
        ) : (
          <UsuariosTabela usuarios={usuarios} />
        )}
      </div>
    </main>
  );
}
