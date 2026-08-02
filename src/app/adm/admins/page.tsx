import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import {
  AdminsGerenciar,
  type AdminItem,
} from "@/components/adm/admins-gerenciar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdmAdminsPage() {
  const sessao = await requireAdmin();

  const admins = await prisma.admin.findMany({
    orderBy: [{ ativo: "desc" }, { nome: "asc" }],
    select: {
      id: true,
      login: true,
      nome: true,
      fotoUrl: true,
      emailPrincipal: true,
      ativo: true,
      precisaTrocarSenha: true,
      ultimoAcesso: true,
      criadoPor: true,
    },
  });

  const itens: AdminItem[] = admins.map((a) => ({
    ...a,
    ultimoAcesso: a.ultimoAcesso ? a.ultimoAcesso.toISOString() : null,
  }));

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="admins" />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Admins do painel
          </h1>
          <p className="text-sm text-muted">
            {admins.length} {admins.length === 1 ? "conta" : "contas"} · qualquer
            admin pode incluir novos.
          </p>
        </div>
        <AdminsGerenciar admins={itens} meuId={sessao.id} />
      </div>
    </main>
  );
}
