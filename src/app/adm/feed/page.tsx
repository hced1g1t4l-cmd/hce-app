import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import { ArtigoAcoes } from "@/components/adm/artigo-acoes";

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

export default async function AdmFeedPage() {
  if (!(await isAuthed())) redirect("/adm/login");

  const artigos = await prisma.artigo.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      titulo: true,
      slug: true,
      autor: true,
      publicado: true,
      updatedAt: true,
    },
  });

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="feed" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-brand-blue">
              Feed HCE · Artigos
            </h1>
            <p className="text-sm text-muted">
              {artigos.length}{" "}
              {artigos.length === 1 ? "artigo" : "artigos"} · publique matérias
              em <strong>/feed</strong>
            </p>
          </div>
          <Link
            href="/adm/feed/novo"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-5 py-2.5 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark"
          >
            Novo artigo
          </Link>
        </div>

        {artigos.length === 0 ? (
          <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
            Nenhum artigo ainda. Clique em <strong>Novo artigo</strong> para
            começar.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-line bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Autor
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Atualizado
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {artigos.map((a) => (
                  <tr key={a.id} className="border-b border-line/70">
                    <td className="px-4 py-3">
                      <Link
                        href={`/adm/feed/${a.id}`}
                        className="font-medium text-brand-blue hover:underline"
                      >
                        {a.titulo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {a.publicado ? (
                        <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                          Publicado
                        </span>
                      ) : (
                        <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                          Rascunho
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {a.autor}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {fmt.format(a.updatedAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <ArtigoAcoes
                        id={a.id}
                        slug={a.slug}
                        publicado={a.publicado}
                      />
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
