import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
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
      createdAt: true,
      artigo: { select: { titulo: true, slug: true } },
      user: { select: { name: true, handle: true, image: true } },
    },
  });

  const comentarios: ComentarioAdm[] = rows.map((c) => ({
    id: c.id,
    texto: c.texto,
    status: (c.status as ComentarioAdm["status"]) ?? "pendente",
    autorNome: c.user.name ?? "Membro HCE",
    autorHandle: c.user.handle,
    autorFoto: c.user.image,
    artigoTitulo: c.artigo.titulo,
    artigoSlug: c.artigo.slug,
    criadoFmt: fmt.format(c.createdAt),
  }));

  const pendentes = comentarios.filter((c) => c.status === "pendente").length;

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="comentarios" />

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
