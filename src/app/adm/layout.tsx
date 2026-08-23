import { getAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmShell } from "@/components/adm/adm-shell";

const JANELA_ONLINE_MS = 15 * 60 * 1000;

// Layout de todo o /adm: fornece o topo e o menu lateral (AdmShell).
// Nas rotas de autenticação o próprio shell se oculta e mostra só o conteúdo.
export default async function AdmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();

  const online = admin
    ? await prisma.admin.findMany({
        where: {
          ativo: true,
          ultimoAcesso: { gte: new Date(Date.now() - JANELA_ONLINE_MS) },
        },
        orderBy: { ultimoAcesso: "desc" },
        select: { id: true, nome: true, fotoUrl: true },
      })
    : [];

  return (
    <AdmShell
      admin={admin ? { nome: admin.nome, fotoUrl: admin.fotoUrl } : null}
      online={online}
    >
      {children}
    </AdmShell>
  );
}
