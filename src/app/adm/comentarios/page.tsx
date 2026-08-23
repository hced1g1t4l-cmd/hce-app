import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import {
  ComentariosModerar,
  type ComentarioAdm,
} from "@/components/adm/comentarios-moderar";

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

export default async function AdmComentariosPage() {
  await requireAdmin();

  const rows = await prisma.comentario.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      texto: true,
      status: true,
      parentId: true,
      createdAt: true,
      artigo: { select: { titulo: true, slug: true } },
      user: { select: { name: true, handle: true, image: true } },
      admin: { select: { nome: true, fotoUrl: true } },
    },
  });

  const comentarios: ComentarioAdm[] = rows.map((c) => ({
    id: c.id,
    texto: c.texto,
    status: (c.status as ComentarioAdm["status"]) ?? "pendente",
    ehHce: c.admin != null,
    ehResposta: c.parentId != null,
    podeResponder: c.parentId == null,
    autorNome:
      c.admin?.nome ?? c.user?.name ?? (c.admin != null ? "HCE" : "Membro HCE"),
    autorHandle: c.admin != null ? null : (c.user?.handle ?? null),
    autorFoto: c.admin?.fotoUrl ?? c.user?.image ?? null,
    artigoTitulo: c.artigo.titulo,
    artigoSlug: c.artigo.slug,
    criadoFmt: fmt.format(c.createdAt),
  }));

  const pendentes = comentarios.filter((c) => c.status === "pendente").length;

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Comentários · moderação
          </h1>
          <p className="text-sm text-muted">
            {comentarios.length}{" "}
            {comentarios.length === 1 ? "comentário" : "comentários"}
            {pendentes > 0 && (
              <>
                {" · "}
                <strong className="text-amber-700">
                  {pendentes} aguardando aprovação
                </strong>
              </>
            )}
          </p>
        </div>

        <ComentariosModerar comentarios={comentarios} />
      </div>
    </main>
  );
}
