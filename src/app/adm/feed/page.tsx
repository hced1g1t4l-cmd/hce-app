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
      capaUrl: true,
      publicado: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // ID sequencial estável (ART_001, ART_002...), pela ordem de criação:
  // o artigo mais antigo é o ART_001, independentemente da ordenação da lista.
  const ordemCriacao = new Map(
    [...artigos]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((a, i) => [a.id, i + 1] as const),
  );
  const codigo = (id: string) =>
    `ART_${String(ordemCriacao.get(id) ?? 0).padStart(3, "0")}`;

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
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    ID
                  </th>
                  <th className="px-4 py-3 font-semibold">Título</th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Autor
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    Criado em
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
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {a.capaUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={a.capaUrl}
                            alt={`Capa de ${a.titulo}`}
                            className="h-10 w-14 shrink-0 rounded-md border border-line object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden
                            title="Sem capa"
                            className="flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface-soft text-muted"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </span>
                        )}
                        <span className="font-mono text-xs font-semibold text-brand-blue">
                          {codigo(a.id)}
                        </span>
                      </div>
                    </td>
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
                      {fmt.format(a.createdAt)}
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
