import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Podcast HCE · Em breve",
  description:
    "O podcast da HCE está chegando: conversas sobre hospitalidade, atendimento, fidelização e gestão de Alimentos & Bebidas.",
  alternates: { canonical: "/podcast" },
  openGraph: {
    title: "Podcast HCE · Em breve",
    description:
      "Conversas sobre hospitalidade, atendimento, fidelização e gestão de A&B. Em breve.",
    url: "/podcast",
  },
};

export default function PodcastPage() {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-24 text-white sm:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-blue-light/40 blur-3xl"
          />
          <Container className="relative max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-amber px-4 py-1.5 font-display text-xs font-bold tracking-widest text-brand-blue-deep uppercase">
              Em breve
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold text-balance text-white sm:text-5xl">
              O Podcast HCE está chegando
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Conversas sobre hospitalidade, atendimento, fidelização e gestão de
              Alimentos &amp; Bebidas — conteúdo para inspirar e destravar o seu
              negócio. Estamos preparando os primeiros episódios.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/avise-me" size="lg">
                Quero ser avisado
              </Button>
              <Button
                href="/feed"
                size="lg"
                variant="secondary"
                className="border-brand-amber/70 text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
              >
                Ver o Feed HCE
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
