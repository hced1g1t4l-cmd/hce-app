import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
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

export default async function AdmUsuariosPage() {
  if (!(await isAuthed())) redirect("/adm/login");

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
    image: u.image,
    bio: u.bio,
    endereco: formatarEndereco(u) || null,
    linkedin: u.linkedin,
    instagram: u.instagram,
    facebook: u.facebook,
  }));

  const optIn = usuarios.filter((u) => u.aceitaComunicacoes).length;

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
