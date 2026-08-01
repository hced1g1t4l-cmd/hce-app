import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { CompartilharArtigo } from "@/components/site/compartilhar-artigo";
import { prisma } from "@/lib/db";
import { dataLonga } from "@/lib/feed";
import { getSessionUser } from "@/lib/auth-user";

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

  const data = artigo.publicadoEm ?? artigo.updatedAt;

  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        <article className="bg-white pb-20">
          {/* CABEÇALHO DA MATÉRIA */}
          <header className="bg-gradient-to-b from-brand-blue to-brand-blue-deep py-14 text-white sm:py-16">
            <Container className="max-w-3xl">
              <Link
                href="/feed"
                className="text-sm font-semibold text-brand-amber transition-colors hover:text-brand-amber-dark"
              >
                ← Feed HCE
              </Link>
              <h1 className="mt-4 font-display text-3xl font-extrabold text-balance sm:text-4xl">
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

          {/* CAPA */}
          {artigo.capaUrl && (
            <Container className="max-w-3xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={artigo.capaUrl}
                alt={artigo.titulo}
                className="-mt-8 aspect-video w-full rounded-2xl border border-line object-cover shadow-lg sm:-mt-10"
              />
            </Container>
          )}

          {/* CONTEÚDO — HTML criado no editor do /adm (autor confiável/autenticado) */}
          <Container className="max-w-3xl">
            <div
              className="materia mt-10"
              dangerouslySetInnerHTML={{ __html: artigo.conteudoHtml }}
            />
            <div className="mt-12">
              <CompartilharArtigo
                caminho={`/feed/${artigo.slug}`}
                titulo={artigo.titulo}
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
              <Button href="/clube" size="lg">
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
