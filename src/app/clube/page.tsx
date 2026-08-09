import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { ClubePlanos } from "@/components/site/clube-planos";

export const metadata: Metadata = {
  title: "+HCE · Planos e assinatura",
  description:
    "O +HCE é o clube por assinatura da HCE: acervo de receitas e fichas técnicas, e-books, soluções da cozinha e comunidade. Conheça os planos.",
  alternates: { canonical: "/clube" },
  openGraph: {
    title: "+HCE · Planos e assinatura",
    description:
      "Acervo de receitas e fichas técnicas, e-books, soluções da cozinha e comunidade. Conheça os planos do +HCE.",
    url: "/clube",
  },
};

const CADENCIA = [
  {
    ritmo: "Toda semana",
    titulo: "Novas soluções para Cozinha",
    texto: "Conteúdo técnico prático, publicado semanalmente.",
  },
  {
    ritmo: "Todo mês",
    titulo: "Novas Receitas",
    texto: "A biblioteca de receitas cresce mês a mês.",
  },
  {
    ritmo: "Mês a mês",
    titulo: "Novos e-books",
    texto: "Materiais aprofundados sobre técnica, ciência e gestão.",
  },
];

export default function ClubePage() {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* INTRO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <Container className="relative text-center">
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              Em breve
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              +HCE: conteúdo que vira resultado
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Uma experiência de aprendizagem por assinatura, com receitas,
              fichas técnicas, e-books e conteúdos desenvolvidos para fortalecer
              a prática profissional em gastronomia. Uma comunidade para quem quer
              evoluir na cozinha e na gestão do seu negócio, no seu ritmo.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/avise-me" size="lg">
                Quero ser avisado do lançamento
              </Button>
            </div>
          </Container>
        </section>

        {/* PLANOS */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Planos
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Encontre a assinatura ideal para você
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Comece pelo Feed HCE, gratuitamente, e avance conforme seus
                objetivos. Do conteúdo aberto ao aprofundamento técnico, há uma
                opção para cada etapa da sua jornada.
              </p>
            </div>

            <div className="mt-14">
              <ClubePlanos />
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted">
              Pague com cartão de crédito (cobrança recorrente) ou PIX.
            </p>
          </Container>
        </section>

        {/* CADÊNCIA DE CONTEÚDO */}
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Aprendizado contínuo
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Sempre há algo novo para explorar
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                O +HCE recebe atualizações frequentes com novos materiais para
                apoiar seu desenvolvimento na gastronomia, na hospitalidade e na
                gestão.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {CADENCIA.map((c) => (
                <article
                  key={c.titulo}
                  className="reveal flex flex-col rounded-2xl border border-line bg-surface-soft p-8"
                >
                  <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                    {c.ritmo}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-brand-blue">
                    {c.titulo}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{c.texto}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section className="bg-brand-blue py-20 text-white sm:py-24">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-brand-amber sm:text-4xl">
                O +HCE ainda não abriu, mas você pode garantir seu lugar
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-white/80">
                Deixe seu contato e avisaremos em primeira mão quando o +HCE for
                lançado, com condições especiais para quem chegar cedo.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Button href="/avise-me" size="lg">
                  Quero ser avisado do lançamento
                </Button>
              </div>
            </div>

            <div className="reveal relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                  src="/brand/posts/o-que-oferece.jpeg"
                  alt="Prévia dos conteúdos do +HCE: receitas, fichas técnicas e e-books"
                  width={819}
                  height={1024}
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
