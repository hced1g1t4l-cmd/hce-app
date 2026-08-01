import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ArtigoCard, type FeedItem } from "@/components/site/feed-artigo-card";
import { FeedCarrossel } from "@/components/site/feed-carrossel";
import { prisma } from "@/lib/db";
import { dataLonga } from "@/lib/feed";
import { getSessionUser } from "@/lib/auth-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Feed HCE · Artigos e conteúdos",
  description:
    "O Feed HCE reúne artigos, dicas e conteúdos sobre gastronomia, hospitalidade, gestão e A&B — conhecimento técnico em tom de matéria.",
  alternates: { canonical: "/feed" },
  openGraph: {
    title: "Feed HCE · Artigos e conteúdos",
    description:
      "Artigos, dicas e conteúdos sobre gastronomia, hospitalidade e gestão de A&B.",
    url: "/feed",
  },
};

export default async function FeedPage() {
  // Frente A: o Feed (mesmo gratuito) exige conta. Visitante sem sessao vai
  // para o cadastro grátis e volta para o Feed depois de entrar.
  const sessao = await getSessionUser();
  if (!sessao) redirect("/criar-conta?redirect=/feed");
  // E-mail obrigatoriamente confirmado.
  if (!sessao.emailVerificado) redirect("/verificar-email?apos=/feed");

  const artigos = await prisma.artigo.findMany({
    where: { publicado: true },
    orderBy: [{ publicadoEm: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      titulo: true,
      resumo: true,
      capaUrl: true,
      autor: true,
      publicadoEm: true,
      updatedAt: true,
    },
  });

  const itens: FeedItem[] = artigos.map((a) => ({
    id: a.id,
    slug: a.slug,
    titulo: a.titulo,
    resumo: a.resumo,
    capaUrl: a.capaUrl,
    meta: `${a.autor} · ${dataLonga(a.publicadoEm ?? a.updatedAt)}`,
  }));

  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* INTRO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-10 text-white sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <Container className="relative text-center">
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              Feed HCE
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              Conteúdo que forma e transforma
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Artigos, dicas e reflexões sobre gastronomia, hospitalidade e
              gestão de Alimentos &amp; Bebidas — direto de quem vive o setor.
            </p>
          </Container>
        </section>

        {/* LISTAGEM */}
        <section className="bg-surface-soft py-10 sm:py-14">
          <Container>
            {itens.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-12 text-center">
                <h2 className="font-display text-2xl font-bold text-brand-blue">
                  Em breve, os primeiros conteúdos
                </h2>
                <p className="mt-3 leading-relaxed text-muted">
                  Estamos preparando as primeiras matérias do Feed HCE. Volte em
                  breve — ou acompanhe a HCE nas redes sociais.
                </p>
              </div>
            ) : (
              <>
                {/* Mobile: carrossel (último artigo já em foto + texto) */}
                <FeedCarrossel items={itens} className="md:hidden" />

                {/* Desktop/tablet: grade */}
                <div className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
                  {itens.map((it) => (
                    <ArtigoCard key={it.id} item={it} className="reveal" />
                  ))}
                </div>
              </>
            )}
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
