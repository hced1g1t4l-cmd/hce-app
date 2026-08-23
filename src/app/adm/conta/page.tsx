import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AvatarEditor } from "@/components/site/avatar-editor";
import { PerfilEmailsForm } from "@/components/adm/perfil-emails-form";
import { TrocarSenhaForm } from "@/components/adm/trocar-senha-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdmContaPage() {
  const sessao = await requireAdmin();
  const admin = await prisma.admin.findUnique({ where: { id: sessao.id } });
  if (!admin) return null;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="font-display text-xl font-bold text-brand-blue">
          Minha conta
        </h1>
        <p className="text-sm text-muted">
          Login: <strong>{admin.login}</strong>
        </p>

        {/* FOTO */}
        <section className="mt-6 rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            Foto de perfil
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <AvatarEditor
              initialImage={admin.fotoUrl}
              nome={admin.nome}
              endpoint="/api/adm/perfil/avatar"
            />
            <div className="text-sm text-muted">
              <p className="font-semibold text-ink">{admin.nome}</p>
              <p>Passe o mouse sobre a foto e clique para atualizar.</p>
            </div>
          </div>
        </section>

        {/* E-MAILS DE RESGATE */}
        <section className="mt-6 rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            E-mails de resgate de senha
          </h2>
          <div className="mt-4">
            <PerfilEmailsForm
              emailPrincipal={admin.emailPrincipal}
              emailSecundario={admin.emailSecundario}
            />
          </div>
        </section>

        {/* SENHA */}
        <section className="mt-6 rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            Mudar senha
          </h2>
          <div className="mt-4">
            <TrocarSenhaForm exigeAtual />
          </div>
        </section>
      </div>
    </main>
  );
}
