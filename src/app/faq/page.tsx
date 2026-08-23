import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TexturaAzul } from "@/components/site/textura-azul";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { EMAIL_CONTATO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Perguntas frequentes · HCE",
  description:
    "Tire suas dúvidas sobre a HCE: serviços de consultoria e educação, o +HCE, planos, atendimento e contato.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Perguntas frequentes · HCE",
    description:
      "Dúvidas sobre a HCE, os serviços de consultoria e educação e o +HCE.",
    url: "/faq",
  },
};

const linkClasses =
  "font-semibold text-brand-blue underline underline-offset-2 transition-colors hover:text-brand-amber-dark";

type QA = { q: string; a: ReactNode };
type Grupo = { titulo: string; itens: QA[] };

const GRUPOS: Grupo[] = [
  {
    titulo: "Sobre a HCE",
    itens: [
      {
        q: "O que significa HCE?",
        a: "HCE é a sigla de Hospitalidade, Consultoria e Educação. Somos a união das trajetórias de Cris Leite e Gio Gropello, dedicada a desenvolver pessoas, fortalecer equipes e impulsionar resultados no setor de Alimentos & Bebidas.",
      },
      {
        q: "Para quem a HCE trabalha?",
        a: "Para pequenas e médias empresas de A&B e foodservice, profissionais de cozinha, gestores e empreendedores, estudantes de gastronomia e também para amadores e curiosos que querem cozinhar com mais técnica.",
      },
    ],
  },
  {
    titulo: "Serviços e consultoria",
    itens: [
      {
        q: "Quais serviços vocês oferecem?",
        a: (
          <>
            Consultoria e diagnóstico de operações, elaboração de cardápio,
            padronização de processos, gestão de custos (CMV), treinamento de
            equipes, hospitalidade, cursos e palestras. Veja todas as áreas em{" "}
            <Link href="/servicos" className={linkClasses}>
              O que fazemos
            </Link>
            .
          </>
        ),
      },
      {
        q: "Como funciona a consultoria?",
        a: "Começamos por um diagnóstico da operação, construímos um plano de ação priorizado e apoiamos a implementação. O trabalho pode ser um projeto pontual, um acompanhamento recorrente ou um programa in company para a sua equipe.",
      },
      {
        q: "O atendimento é presencial ou on-line?",
        a: "A HCE está sediada no Rio de Janeiro e atende presencialmente na região. Para consultorias, cursos e mentorias, também oferece atendimento on-line em todo o Brasil.",
      },
      {
        q: "Como peço um orçamento?",
        a: (
          <>
            É só contar o seu desafio pelo formulário{" "}
            <Link href="/fale-com-a-hce" className={linkClasses}>
              Fale com a HCE
            </Link>
            . A partir disso, desenhamos a proposta ideal para o seu momento.
          </>
        ),
      },
    ],
  },
  {
    titulo: "+HCE",
    itens: [
      {
        q: "O que é o +HCE?",
        a: "O +HCE oferece diferentes planos de assinatura com acesso a receitas, e-books, artigos, notícias, soluções para a cozinha e uma comunidade desenvolvida para amadores, profissionais, gestores e empresas que desejam evoluir na gastronomia.",
      },
      {
        q: "Quando o +HCE será lançado?",
        a: (
          <>
            Estamos nos últimos ajustes. Cadastre-se em{" "}
            <Link href="/avise-me" className={linkClasses}>
              Quero ser avisado
            </Link>{" "}
            para receber o lançamento em primeira mão e garantir condições
            especiais para os primeiros assinantes.
          </>
        ),
      },
      {
        q: "Quais são os planos e preços?",
        a: (
          <>
            Serão três planos, do Gratuito ao Profissional, com opção avulsa e
            anual (com desconto). Veja os detalhes na página do{" "}
            <Link href="/mais-hce" className={linkClasses}>
              +HCE
            </Link>
            .
          </>
        ),
      },
      {
        q: "Como será o pagamento?",
        a: "Com cartão de crédito (cobrança recorrente) ou PIX. Enquanto o checkout não está disponível, você pode se cadastrar para ser avisado do lançamento.",
      },
    ],
  },
  {
    titulo: "Contato",
    itens: [
      {
        q: "Como falo com a HCE?",
        a: (
          <>
            Pelo formulário{" "}
            <Link href="/fale-com-a-hce" className={linkClasses}>
              Fale com a HCE
            </Link>{" "}
            ou pelo e-mail{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
              {EMAIL_CONTATO}
            </a>
            . Você também nos encontra nas redes sociais no rodapé do site.
          </>
        ),
      },
    ],
  },
];

// Versão em texto puro das perguntas/respostas para o dado estruturado
// FAQPage (rich result do Google). Mantida separada das respostas em JSX.
const FAQ_TEXTO: { q: string; a: string }[] = [
  {
    q: "O que significa HCE?",
    a: "HCE é a sigla de Hospitalidade, Consultoria e Educação. Somos a união das trajetórias de Cris Leite e Gio Gropello, dedicada a desenvolver pessoas, fortalecer equipes e impulsionar resultados no setor de Alimentos & Bebidas.",
  },
  {
    q: "Para quem a HCE trabalha?",
    a: "Para pequenas e médias empresas de A&B e foodservice, profissionais de cozinha, gestores e empreendedores, estudantes de gastronomia e também para amadores e curiosos que querem cozinhar com mais técnica.",
  },
  {
    q: "Quais serviços vocês oferecem?",
    a: "Consultoria e diagnóstico de operações, elaboração de cardápio, padronização de processos, gestão de custos (CMV), treinamento de equipes, hospitalidade, cursos e palestras.",
  },
  {
    q: "Como funciona a consultoria?",
    a: "Começamos por um diagnóstico da operação, construímos um plano de ação priorizado e apoiamos a implementação. O trabalho pode ser um projeto pontual, um acompanhamento recorrente ou um programa in company para a sua equipe.",
  },
  {
    q: "O atendimento é presencial ou on-line?",
    a: "A HCE está sediada no Rio de Janeiro e atende presencialmente na região. Para consultorias, cursos e mentorias, também oferece atendimento on-line em todo o Brasil.",
  },
  {
    q: "Como peço um orçamento?",
    a: "É só contar o seu desafio pelo formulário Fale com a HCE. A partir disso, desenhamos a proposta ideal para o seu momento.",
  },
  {
    q: "O que é o +HCE?",
    a: "O +HCE oferece diferentes planos de assinatura com acesso a receitas, e-books, artigos, notícias, soluções para a cozinha e uma comunidade desenvolvida para amadores, profissionais, gestores e empresas que desejam evoluir na gastronomia.",
  },
  {
    q: "Quando o +HCE será lançado?",
    a: "Estamos nos últimos ajustes. Cadastre-se em Quero ser avisado para receber o lançamento em primeira mão e garantir condições especiais para os primeiros assinantes.",
  },
  {
    q: "Quais são os planos e preços?",
    a: "Serão quatro planos, do Gratuito ao Premium, com opção avulsa e anual (com desconto). Veja os detalhes na página do +HCE.",
  },
  {
    q: "Como será o pagamento?",
    a: "Com cartão de crédito (cobrança recorrente) ou PIX. Enquanto o checkout não está disponível, você pode se cadastrar para ser avisado do lançamento.",
  },
  {
    q: "Como falo com a HCE?",
    a: `Pelo formulário Fale com a HCE ou pelo e-mail ${EMAIL_CONTATO}. Você também nos encontra nas redes sociais no rodapé do site.`,
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_TEXTO.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd} />
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* INTRO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-16 text-white sm:py-20">
          <TexturaAzul src="/brand/texturas/textura-cozinha-4.jpg" opacidade={0.16} veu={0} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <Container className="relative text-center">
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              Dúvidas
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              Perguntas frequentes
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Reunimos as principais dúvidas sobre a HCE, os nossos serviços e o
              +HCE. Não achou o que procurava? Fale com a gente.
            </p>
          </Container>
        </section>

        {/* PERGUNTAS */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container className="max-w-3xl">
            <div className="space-y-12">
              {GRUPOS.map((g) => (
                <div key={g.titulo}>
                  <h2 className="font-display text-2xl font-bold text-brand-blue">
                    {g.titulo}
                  </h2>
                  <div className="mt-6 space-y-4">
                    {g.itens.map((item) => (
                      <details
                        key={item.q}
                        className="group rounded-2xl border border-line bg-white p-6 open:shadow-sm"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-brand-blue [&::-webkit-details-marker]:hidden">
                          <span>{item.q}</span>
                          <span
                            aria-hidden
                            className="ml-2 shrink-0 text-2xl leading-none text-brand-amber-dark transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                          >
                            +
                          </span>
                        </summary>
                        <div className="mt-4 leading-relaxed text-muted">
                          {item.a}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA FINAL */}
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-brand-blue-deep px-8 py-14 text-center text-white sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-brand-amber/15 blur-3xl"
              />
              <h2 className="relative font-display text-2xl font-bold text-brand-amber sm:text-3xl">
                Ainda tem dúvidas?
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/80">
                Estamos por aqui para ajudar. Envie a sua pergunta e retornamos o
                quanto antes.
              </p>
              <div className="relative mt-8 flex justify-center">
                <Button href="/fale-com-a-hce" size="lg">
                  Falar com a HCE
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
