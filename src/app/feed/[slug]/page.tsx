import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { CompartilharArtigo } from "@/components/site/compartilhar-artigo";
import { GaleriaArtigo } from "@/components/site/galeria-artigo";
import { ReacoesArtigo } from "@/components/site/reacoes-artigo";
import { FeedTracker } from "@/components/site/feed-tracker";
import { TexturaAzul } from "@/components/site/textura-azul";
import {
  ComentariosArtigo,
  type ComentarioPublico,
} from "@/components/site/comentarios-artigo";
import { prisma } from "@/lib/db";
import { dataLonga } from "@/lib/feed";
import { getSessionUser } from "@/lib/auth-user";
import {
  contagemZero,
  type ContagemReacoes,
  type ReacaoTipo,
} from "@/lib/reacoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getArtigo(slug: string) {
  return prisma.artigo.findFirst({
    where: { slug, publicado: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artigo = await getArtigo(slug);
  if (!artigo) return { title: "Artigo não encontrado · Feed HCE" };
  return {
    title: `${artigo.titulo} · Feed HCE`,
    description: artigo.resumo ?? undefined,
    alternates: { canonical: `/feed/${artigo.slug}` },
    openGraph: {
      title: artigo.titulo,
      description: artigo.resumo ?? undefined,
      url: `/feed/${artigo.slug}`,
      type: "article",
      images: artigo.capaUrl ? [{ url: artigo.capaUrl }] : undefined,
    },
  };
}

export default async function ArtigoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Frente A: matéria só abre para quem tem conta (cadastro grátis).
  const sessao = await getSessionUser();
  if (!sessao) {
    redirect(`/criar-conta?redirect=/feed/${slug}`);
  }
  // E-mail obrigatoriamente confirmado.
  if (!sessao.emailVerificado) {
    redirect(`/verificar-email?apos=/feed/${slug}`);
  }

  const artigo = await getArtigo(slug);
  if (!artigo) notFound();

  // Métrica de acesso ao artigo (BAC_109). O tempo de permanência chega depois
  // pelo beacon do <FeedTracker/>.
  const acesso = await prisma.feedAcesso.create({
    data: { userId: sessao.id, artigoId: artigo.id },
    select: { id: true },
  });

  const data = artigo.publicadoEm ?? artigo.updatedAt;

  // Reações: contagem por tipo + a reação do usuário atual.
  const [gruposReacao, minhaReacaoRow, comentariosRows] = await Promise.all([
    prisma.artigoReacao.groupBy({
      by: ["tipo"],
      where: { artigoId: artigo.id },
      _count: { tipo: true },
    }),
    prisma.artigoReacao.findUnique({
      where: { artigoId_userId: { artigoId: artigo.id, userId: sessao.id } },
      select: { tipo: true },
    }),
    prisma.comentario.findMany({
      where: { artigoId: artigo.id, status: "aprovado" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        texto: true,
        parentId: true,
        createdAt: true,
        user: { select: { name: true, handle: true, image: true } },
        admin: { select: { nome: true, fotoUrl: true } },
      },
    }),
  ]);

  const contagem: ContagemReacoes = contagemZero();
  for (const g of gruposReacao) {
    if (g.tipo in contagem) contagem[g.tipo as ReacaoTipo] = g._count.tipo;
  }
  const minhaReacao = (minhaReacaoRow?.tipo ?? null) as ReacaoTipo | null;

  const fmtData = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  // Monta a árvore: comentários de 1º nível (mais recentes primeiro) com as
  // suas respostas (em ordem cronológica). Respostas da HCE têm ehHce=true.
  const paraDto = (c: (typeof comentariosRows)[number]): ComentarioPublico => ({
    id: c.id,
    texto: c.texto,
    ehHce: c.admin != null,
    autorNome:
      c.admin?.nome ?? c.user?.name ?? (c.admin != null ? "HCE" : "Membro HCE"),
    autorHandle: c.admin != null ? null : (c.user?.handle ?? null),
    autorFoto: c.admin?.fotoUrl ?? c.user?.image ?? null,
    dataFmt: fmtData.format(c.createdAt),
    respostas: [],
  });

  const porPai = new Map<string, ComentarioPublico[]>();
  for (const c of comentariosRows) {
    if (c.parentId) {
      const arr = porPai.get(c.parentId) ?? [];
      arr.push(paraDto(c));
      porPai.set(c.parentId, arr);
    }
  }
  const comentarios: ComentarioPublico[] = comentariosRows
    .filter((c) => c.parentId == null)
    .map((c) => ({ ...paraDto(c), respostas: porPai.get(c.id) ?? [] }))
    .reverse();

  return (
    <>
      <SiteHeader />
      <FeedTracker viewId={acesso.id} />

      <main id="conteudo" className="flex-1">
        <article className="bg-white pb-20">
          {/* CABEÇALHO DA MATÉRIA */}
          <header className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-14 text-white sm:py-16">
            <TexturaAzul
              src="/brand/texturas/textura-cozinha-3.jpg"
              opacidade={0.16}
              veu={0}
            />
            <Container className="relative max-w-3xl">
              <Link
                href="/feed"
                className="text-sm font-semibold text-brand-amber transition-colors hover:text-brand-amber-dark"
              >
                ← Feed HCE
              </Link>
              <h1 className="mt-4 font-display text-3xl font-bold text-balance sm:text-4xl">
                {artigo.titulo}
              </h1>
              {artigo.resumo && (
                <p className="mt-4 text-lg leading-relaxed text-white/80">
                  {artigo.resumo}
                </p>
              )}
              <p className="mt-6 text-sm text-white/70">
                Redigido por{" "}
                <span className="font-semibold text-white">{artigo.autor}</span>{" "}
                · Última atualização em {dataLonga(data)}
              </p>
            </Container>
          </header>

          {/* CAPA + GALERIA (carrossel a partir da capa) */}
          {(artigo.capaUrl || artigo.galeria.length > 0) && (
            <Container className="max-w-3xl">
              <GaleriaArtigo
                capa={artigo.capaUrl}
                galeria={artigo.galeria}
                creditos={[artigo.capaCredito, ...artigo.galeriaCreditos]}
                titulo={artigo.titulo}
              />
            </Container>
          )}

          {/* COMPARTILHAR — no início do artigo */}
          <Container className="max-w-3xl">
            <div className="mt-8">
              <CompartilharArtigo
                caminho={`/feed/${artigo.slug}`}
                titulo={artigo.titulo}
              />
            </div>
          </Container>

          {/* CONTEÚDO — HTML criado no editor do /adm (autor confiável/autenticado) */}
          <Container className="max-w-3xl">
            <div
              className="materia mt-10"
              dangerouslySetInnerHTML={{ __html: artigo.conteudoHtml }}
            />
          </Container>

          {/* REAÇÕES + COMENTÁRIOS */}
          <Container className="max-w-3xl">
            <div className="mt-12 border-t border-line pt-10">
              <ReacoesArtigo
                artigoId={artigo.id}
                contagemInicial={contagem}
                minhaInicial={minhaReacao}
              />
            </div>
            <div className="mt-10">
              <ComentariosArtigo
                artigoId={artigo.id}
                comentarios={comentarios}
                meuHandle={sessao.handle}
              />
            </div>
          </Container>
        </article>

        {/* CTA FINAL */}
        <section className="bg-surface-soft py-16">
          <Container className="max-w-3xl text-center">
            <h2 className="font-display text-2xl font-bold text-brand-blue">
              Gostou do conteúdo?
            </h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted">
              O +HCE reúne receitas, fichas técnicas, e-books e comunidade
              para quem quer ir além.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/mais-hce" size="lg">
                Conhecer o +HCE
              </Button>
              <Button
                href="/feed"
                size="lg"
                variant="blue"
              >
                Ver mais artigos
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
