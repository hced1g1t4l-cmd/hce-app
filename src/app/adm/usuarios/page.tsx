import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";

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

const PLANO_LABEL: Record<string, string> = {
  free: "Gratuito",
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

export default async function AdmUsuariosPage() {
  if (!(await isAuthed())) redirect("/adm/login");

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      telefone: true,
      plano: true,
      aceitaComunicacoes: true,
      createdAt: true,
    },
  });

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
            {optIn} aceitam comunicações
          </p>
        </div>

        {usuarios.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
            Nenhuma conta criada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Cadastro
                  </th>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Telefone
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Plano
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Comunicações
                  </th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-line/70">
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {fmt.format(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {u.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 break-all">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {u.telefone ?? "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                        {PLANO_LABEL[u.plano] ?? u.plano}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {u.aceitaComunicacoes ? (
                        <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                          Sim
                        </span>
                      ) : (
                        <span className="text-muted">Não</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
