import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "O que fazemos · Serviços da HCE",
  description:
    "Consultoria, elaboração de cardápio, padronização de processos, gestão de custos, treinamento de equipes, hospitalidade, cursos e palestras em Alimentos & Bebidas.",
  alternates: { canonical: "/servicos" },
  openGraph: {
    title: "O que fazemos · Serviços da HCE",
    description:
      "As áreas de atuação da HCE em consultoria, educação e hospitalidade para o setor de Alimentos & Bebidas.",
    url: "/servicos",
  },
};

const SERVICOS = [
  {
    titulo: "Consultoria e diagnóstico de operações",
    texto:
      "Análise completa da operação de A&B, gestão, processos e qualidade, com um plano de ação claro e priorizado.",
    modelos: ["Projeto", "Recorrente"],
  },
  {
    titulo: "Engenharia e elaboração de cardápio",
    texto:
      "Criação e reestruturação de cardápios com ficha técnica, precificação e foco em rentabilidade.",
    modelos: ["Projeto"],
  },
  {
    titulo: "Padronização de processos e fichas técnicas",
    texto:
      "Padronização operacional da cozinha: fichas técnicas, POPs e controle de qualidade para consistência em escala.",
    modelos: ["Projeto", "In company"],
  },
  {
    titulo: "Gestão de custos e resultados (CMV)",
    texto:
      "Controle de CMV, redução de desperdício e indicadores de produtividade para uma operação mais rentável.",
    modelos: ["Projeto", "Recorrente"],
  },
  {
    titulo: "Treinamento de equipes",
    texto:
      "Treinamentos in company para cozinha e salão, do técnico ao comportamental, com foco em desempenho.",
    modelos: ["In company"],
  },
  {
    titulo: "Hospitalidade e experiência do cliente",
    texto:
      "Cultura de serviço, atendimento e fidelização — transformando hospitalidade em um diferencial competitivo.",
    modelos: ["In company", "Palestra"],
  },
  {
    titulo: "Liderança e gestão de pessoas",
    texto:
      "Desenvolvimento de líderes e gestores de A&B para formar e reter equipes de alta performance.",
    modelos: ["In company", "Mentoria"],
  },
  {
    titulo: "Cursos, workshops e formação",
    texto:
      "Cursos e workshops de gastronomia, técnica e gestão — abertos ao público ou fechados para a sua equipe.",
    modelos: ["Curso", "Workshop"],
  },
  {
    titulo: "Palestras, mentorias e conteúdo",
    texto:
      "Palestras e mentorias sobre gastronomia, hospitalidade e gestão, além de conteúdo autoral (como o podcast HCE).",
    modelos: ["Palestra", "Mentoria"],
  },
];

const MODELOS = [
  {
    nome: "Projeto pontual",
    texto: "Escopo definido com início, meio e entrega — ideal para uma demanda específica.",
  },
  {
    nome: "Consultoria recorrente",
    texto: "Acompanhamento contínuo (mensal) para evoluir a operação de forma sustentável.",
  },
  {
    nome: "In company",
    texto: "Treinamentos e programas fechados, desenhados para a realidade da sua equipe.",
  },
  {
    nome: "Curso / Workshop",
    texto: "Formações abertas ou fechadas, presenciais ou online.",
  },
  {
    nome: "Palestra / Mentoria",
    texto: "Encontros pontuais para inspirar, direcionar e destravar decisões.",
  },
];

export default function ServicosPage() {
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
              O que fazemos
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              Consultoria, educação e hospitalidade para A&amp;B
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Contribuímos para a formação de profissionais mais preparados,
              empresas mais qualificadas e experiências mais memoráveis, do
              diagnóstico da operação ao desenvolvimento das pessoas.
            </p>
          </Container>
        </section>

        {/* SERVIÇOS */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Áreas de atuação
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Como podemos ajudar o seu negócio
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SERVICOS.map((s, i) => (
                <article
                  key={s.titulo}
                  className="reveal group flex flex-col rounded-2xl border border-line bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue font-display text-lg font-extrabold text-brand-amber transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold text-brand-blue">
                    {s.titulo}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted">
                    {s.texto}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.modelos.map((m) => (
                      <span
                        key={m}
                        className="rounded-full bg-brand-amber-soft px-3 py-1 font-display text-xs font-semibold text-brand-amber-dark"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* MODELOS DE CONTRATAÇÃO */}
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Como contratar
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Modelos de contratação
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Adaptamos o formato ao seu momento e ao seu orçamento. Conte o seu
                desafio e desenhamos a melhor forma de trabalharmos juntos.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MODELOS.map((m) => (
                <article
                  key={m.nome}
                  className="reveal rounded-2xl border border-line bg-surface-soft p-7"
                >
                  <h3 className="font-display text-lg font-bold text-brand-blue">
                    {m.nome}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{m.texto}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section className="bg-brand-blue py-20 text-white sm:py-24">
          <Container className="text-center">
            <h2 className="font-display text-3xl font-bold text-brand-amber sm:text-4xl">
              Vamos transformar o seu negócio?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Conte para a gente o seu desafio. Montamos a proposta ideal para a
              sua operação e a sua equipe.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/fale-com-a-hce" size="lg">
                Falar com a HCE
              </Button>
              <Button
                href="/clube"
                size="lg"
                variant="secondary"
                className="border-brand-amber/70 text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
              >
                Conhecer o +HCE
              </Button>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
