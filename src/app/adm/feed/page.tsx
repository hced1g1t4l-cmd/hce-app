import Link from "next/link";
import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { ArtigosTabela, type ArtigoRow } from "@/components/adm/artigos-tabela";
import { contagemZero, type ReacaoTipo } from "@/lib/reacoes";

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
  await requireAdmin();

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

  // Contadores de reações (por tipo) e comentários (aprovados/pendentes) por artigo.
  const [reacoesRows, comentariosRows] = await Promise.all([
    prisma.artigoReacao.groupBy({
      by: ["artigoId", "tipo"],
      _count: { tipo: true },
    }),
    prisma.comentario.groupBy({
      by: ["artigoId", "status"],
      _count: { status: true },
    }),
  ]);

  const reacoesPorArtigo = new Map<string, ReturnType<typeof contagemZero>>();
  for (const r of reacoesRows) {
    const c = reacoesPorArtigo.get(r.artigoId) ?? contagemZero();
    if (r.tipo in c) c[r.tipo as ReacaoTipo] = r._count.tipo;
    reacoesPorArtigo.set(r.artigoId, c);
  }
  const comentariosPorArtigo = new Map<
    string,
    { aprovados: number; pendentes: number }
  >();
  for (const c of comentariosRows) {
    const atual = comentariosPorArtigo.get(c.artigoId) ?? {
      aprovados: 0,
      pendentes: 0,
    };
    if (c.status === "aprovado") atual.aprovados = c._count.status;
    else if (c.status === "pendente") atual.pendentes = c._count.status;
    comentariosPorArtigo.set(c.artigoId, atual);
  }

  // ID sequencial estável (ART_001, ART_002...), pela ordem de criação:
  // o artigo mais antigo é o ART_001, independentemente da ordenação da lista.
  const ordemCriacao = new Map(
    [...artigos]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((a, i) => [a.id, i + 1] as const),
  );

  const linhas: ArtigoRow[] = artigos.map((a) => {
    const num = ordemCriacao.get(a.id) ?? 0;
    const reacoes = reacoesPorArtigo.get(a.id) ?? contagemZero();
    const reacoesTotal =
      reacoes.gostei + reacoes.amei + reacoes.aplausos + reacoes.inspirador;
    const coment = comentariosPorArtigo.get(a.id) ?? {
      aprovados: 0,
      pendentes: 0,
    };
    return {
      id: a.id,
      codigo: `ART_${String(num).padStart(3, "0")}`,
      num,
      titulo: a.titulo,
      slug: a.slug,
      autor: a.autor,
      capaUrl: a.capaUrl,
      publicado: a.publicado,
      status: a.publicado ? "Publicado" : "Rascunho",
      reacoes,
      reacoesTotal,
      comentariosAprovados: coment.aprovados,
      comentariosPendentes: coment.pendentes,
      criadoTs: a.createdAt.getTime(),
      criadoFmt: fmt.format(a.createdAt),
      atualizadoTs: a.updatedAt.getTime(),
      atualizadoFmt: fmt.format(a.updatedAt),
    };
  });

  return (
    <main className="min-h-screen bg-surface-soft">
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
          <ArtigosTabela artigos={linhas} />
        )}
      </div>
    </main>
  );
}
