import Image from "next/image";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { FounderFlipCard } from "@/components/site/founder-flip-card";
import { ArrowRight, Check } from "@/components/ui/icons";
import { EMAIL_CONTATO } from "@/lib/site";

const PILARES = [
  {
    letra: "h",
    titulo: "Hospitalidade",
    texto:
      "A hospitalidade é um ativo estratégico. Na HCE, desenvolvemos equipes, criamos processos e implementamos soluções que elevam a excelência dos serviços e fortalecem a experiência do cliente.",
  },
  {
    letra: "c",
    titulo: "Consultoria",
    texto:
      "Diagnóstico e melhoria de restaurantes e operações: gestão, qualidade, processos e engenharia de cardápio para resultados mais sustentáveis.",
  },
  {
    letra: "e",
    titulo: "Educação",
    texto:
      "Cursos e treinamentos que formam profissionais mais preparados, elevando o padrão técnico e o cuidado em cada detalhe da gastronomia.",
  },
];

const FUNDADORAS = [
  {
    nome: "Cris Leite",
    papel: "Chef, educadora e consultora",
    foto: "/brand/fotos/chef-cris.png",
    // RAF_009: ponto focal para alinhar a linha dos ombros entre as fotos.
    fotoPos: "center 6%",
    bio: "Mestre em Novas Tecnologias Digitais na Educação, especialista em Gestão de Recursos Humanos e graduada em Gastronomia. Professora, pesquisadora e consultora com ampla experiência em gastronomia, hospitalidade e educação.",
  },
  {
    nome: "Gio Gropello",
    papel: "Chef, educador e consultor",
    foto: "/brand/fotos/chef-gio.png",
    fotoPos: "center 94%",
    bio: "Especialista em Ciência e Tecnologia de Alimentos, MBA em Artes Culinárias e diplomado em Marketing de Alimentos. Professor, chef de cozinha, pesquisador, consultor e produtor de conteúdo, com ampla experiência em gastronomia, educação, hospitalidade e gestão de A&B.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-brand-blue-light/40 blur-3xl"
          />
          {/* Textura sutil (grade de pontos) que some nas bordas: dá profundidade
              ao hero sem competir com o texto. */}
          <div
            aria-hidden
            className="hce-hero-pattern pointer-events-none absolute inset-0"
          />
          <Container className="relative flex flex-col items-center gap-4 pt-8 pb-14 text-center sm:gap-5 sm:pt-10 sm:pb-20">
            <Image
              src="/brand/logos/logo-hce-tight.png"
              alt="HCE"
              width={640}
              height={375}
              priority
              sizes="(max-width: 640px) 60vw, 460px"
              className="h-24 w-auto max-w-full sm:h-28 lg:h-32"
            />
            <div className="flex flex-col items-center gap-3">
              <p className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
                Hospitalidade · Consultoria · Educação
              </p>
              <span aria-hidden className="hce-rule" />
            </div>
            <h1 className="max-w-4xl font-display text-3xl leading-[1.1] font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
              Transformamos conhecimento em hospitalidade, pessoas em
              profissionais e experiências em resultados.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">
              A HCE nasce da união das trajetórias de Cris Leite e Gio
              Gropello, profissionais que compartilham a paixão pela
              gastronomia, pela educação e pelo desenvolvimento de pessoas.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="/clube" size="lg" className="group">
                Conheça o +HCE
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
              <Button
                href="/servicos"
                size="lg"
                variant="secondary"
                className="border-brand-amber/70 text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
              >
                O que fazemos
              </Button>
            </div>
          </Container>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="bg-white py-24">
          <Container className="grid items-center gap-14 lg:grid-cols-2">
            <div className="reveal">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                  Quem somos
                </span>
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
                Duas trajetórias, uma paixão pela gastronomia
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Acreditamos que o conhecimento transforma a gastronomia quando é
                aplicado com técnica, hospitalidade e propósito.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Por isso, reunimos consultoria, educação e produção de
                conhecimento para apoiar pessoas, equipes e empresas em sua
                trajetória de desenvolvimento.
              </p>
              <div className="mt-8">
                <Button href="/quem-somos" variant="blue" size="lg">
                  Conheça nossa história
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {FUNDADORAS.map((f) => (
                <FounderFlipCard key={f.nome} {...f} />
              ))}
            </div>
          </Container>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className="bg-surface-soft py-24">
          <Container>
            <div className="reveal mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                O que fazemos
              </span>
              <div className="mt-4 flex justify-center">
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
                Consultoria, educação e hospitalidade para A&amp;B
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Contribuímos para a formação de profissionais mais preparados,
                empresas mais qualificadas e experiências mais memoráveis, do
                diagnóstico da operação ao desenvolvimento das pessoas.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PILARES.map((p) => (
                <article
                  key={p.titulo}
                  className="reveal group flex flex-col rounded-2xl border border-line bg-white p-8 shadow-brand transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-brand-lg motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <span
                    aria-hidden
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue font-display text-3xl font-extrabold text-brand-amber lowercase transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                  >
                    {p.letra}
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold text-brand-blue">
                    {p.titulo}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{p.texto}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* CLUBE +HCE */}
        <section id="clube" className="bg-brand-blue py-24 text-white">
          <Container className="grid items-center gap-12 lg:grid-cols-2">
            <div className="reveal">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm font-semibold tracking-widest text-brand-amber uppercase">
                  Em breve
                </span>
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-amber sm:text-4xl">
                +HCE: conteúdo que vira resultado
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Um clube por assinatura com receitas, fichas técnicas, ebooks e
                uma comunidade para quem quer evoluir na cozinha e na gestão de
                seu negócio, no seu ritmo.
              </p>
              <ul className="mt-8 space-y-3 text-white/85">
                {[
                  "Biblioteca de receitas e fichas técnicas",
                  "Acervo exclusivo de ebooks e materiais sobre técnicas de cozinha, ciência, história e gestão",
                  "Comunidade e trocas com os especialistas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-amber text-brand-blue-deep"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Button href="/clube" size="lg" className="group">
                  Ver planos do +HCE
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
                <Button
                  href="/avise-me"
                  size="lg"
                  variant="secondary"
                  className="border-brand-amber/70 text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
                >
                  Quero ser avisado
                </Button>
              </div>
            </div>

            <div className="reveal relative mx-auto w-full max-w-md">
              {/* Brilho âmbar sutil atrás da prévia: destaca a imagem sobre o azul. */}
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-4 rounded-[2.25rem] bg-brand-amber/10 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-brand-lg ring-1 ring-white/5">
                <Image
                  src="/brand/posts/o-que-oferece.jpeg"
                  alt="Prévia dos conteúdos do +HCE: receitas, fichas técnicas e ebooks"
                  width={819}
                  height={1024}
                  sizes="(max-width: 1024px) 90vw, 420px"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* CONTATO */}
        <section id="contato" className="bg-white py-24">
          <Container>
            <div className="reveal relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-brand-blue-deep px-8 py-16 text-center text-white shadow-brand-lg sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-brand-amber/15 blur-3xl"
              />
              <div
                aria-hidden
                className="hce-hero-pattern pointer-events-none absolute inset-0"
              />
              <h2 className="relative font-display text-3xl font-bold tracking-tight text-balance text-brand-amber sm:text-4xl">
                Vamos transformar o seu negócio?
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/80">
                Compartilhe o que você deseja realizar. Consultoria, treinamento
                para a equipe ou uma parceria de conteúdo, a HCE está pronta para
                ajudar.
              </p>
              <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/fale-com-a-hce" size="lg" className="group">
                  Falar com a HCE
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Button>
                <Button
                  href={`mailto:${EMAIL_CONTATO}`}
                  size="lg"
                  variant="secondary"
                  className="border-white/40 text-white hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
                >
                  {EMAIL_CONTATO}
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
