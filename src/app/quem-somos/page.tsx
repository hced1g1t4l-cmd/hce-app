import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Quem somos · HCE",
  description:
    "Conheça a HCE — Hospitalidade, Consultoria e Educação. A união das trajetórias de Cris Leite e Gio Gropello, nossa missão, visão e valores.",
  alternates: { canonical: "/quem-somos" },
  openGraph: {
    title: "Quem somos · HCE",
    description:
      "A união das trajetórias de Cris Leite e Gio Gropello. Conheça a missão, a visão e os valores da HCE.",
    url: "/quem-somos",
  },
};

const FUNDADORAS = [
  {
    nome: "Cris Leite",
    papel: "Chef, educadora e consultora",
    foto: "/brand/fotos/chef-cris-2.png",
    fotoPos: "center",
    bio: "Mestre em Novas Tecnologias Digitais na Educação, especialista em Gestão de Recursos Humanos e graduada em Gastronomia. Professora, pesquisadora e consultora com ampla experiência em gastronomia, hospitalidade e educação.",
  },
  {
    nome: "Gio Gropello",
    papel: "Chef, educador e consultor",
    foto: "/brand/fotos/chef-gio-2.png",
    fotoPos: "center 94%",
    bio: "Especialista em Ciência e Tecnologia de Alimentos, MBA em Artes Culinárias e diplomado em Marketing de Alimentos. Professor, chef de cozinha, pesquisador, consultor e produtor de conteúdo, com ampla experiência em gastronomia, educação, hospitalidade e gestão de A&B.",
  },
];

const VALORES = [
  {
    titulo: "Excelência técnica",
    texto:
      "Fundamento e método em cada detalhe, do preparo ao processo de gestão.",
  },
  {
    titulo: "Hospitalidade como cultura",
    texto:
      "Desenvolvemos ambientes em que hospitalidade, profissionalismo e excelência orientam as relações entre clientes, equipes e gestores.",
  },
  {
    titulo: "Educação que transforma",
    texto: "Conhecimento acessível, organizado e pronto para ser aplicado.",
  },
  {
    titulo: "Ética e confiança",
    texto: "Relações transparentes e responsáveis com clientes e parceiros.",
  },
  {
    titulo: "Inovação com propósito",
    texto: "Tecnologia e criatividade a serviço de resultados sustentáveis.",
  },
];

const PILARES = [
  {
    letra: "h",
    titulo: "Hospitalidade",
    texto:
      "A hospitalidade é um ativo estratégico. Desenvolvemos equipes, criamos processos e implementamos soluções que elevam a excelência dos serviços e a experiência do cliente.",
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

export default function QuemSomosPage() {
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
              Quem somos
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              Duas trajetórias, uma paixão pela gastronomia
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              A HCE nasce da união das trajetórias de Cris Leite e Gio Gropello,
              profissionais que compartilham a paixão pela gastronomia, pela
              educação e pelo desenvolvimento de pessoas.
            </p>
          </Container>
        </section>

        {/* NARRATIVA */}
        <section className="bg-white py-20 sm:py-24">
          <Container className="max-w-3xl text-center">
            <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
              Hospitalidade · Consultoria · Educação
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold text-brand-blue sm:text-3xl">
              Conhecimento que transforma pessoas, equipes e negócios
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted">
              Acreditamos que a gastronomia vai além da cozinha. Ela envolve
              técnica, gestão, hospitalidade e o desenvolvimento contínuo de
              pessoas.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Por isso, reunimos consultoria, educação e produção de conhecimento
              para apoiar quem deseja aprender, aperfeiçoar competências,
              fortalecer equipes e desenvolver negócios na gastronomia.
            </p>
          </Container>
        </section>

        {/* FUNDADORES */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Fundadores
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Quem está à frente da HCE
              </h2>
            </div>

            <div className="mx-auto mt-14 grid max-w-4xl gap-8 sm:grid-cols-2">
              {FUNDADORAS.map((f) => (
                <article
                  key={f.nome}
                  className="reveal overflow-hidden rounded-3xl border border-line bg-white"
                >
                  <div className="relative aspect-square border-b border-line bg-gradient-to-b from-brand-blue/10 to-brand-blue/5">
                    <Image
                      src={f.foto}
                      alt={`${f.nome}, ${f.papel}`}
                      fill
                      sizes="(max-width: 640px) 90vw, 400px"
                      style={{ objectPosition: f.fotoPos }}
                      className="object-cover"
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="font-display text-2xl font-bold text-brand-blue">
                      {f.nome}
                    </h3>
                    <p className="mt-1 font-display text-sm font-semibold tracking-wide text-brand-amber-dark uppercase">
                      {f.papel}
                    </p>
                    <p className="mt-4 leading-relaxed text-muted">{f.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* MISSÃO / VISÃO */}
        <section className="bg-white py-20 sm:py-24">
          <Container className="grid gap-6 lg:grid-cols-2">
            <article className="reveal rounded-3xl bg-gradient-to-br from-brand-blue to-brand-blue-deep p-10 text-white">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber uppercase">
                Missão
              </span>
              <p className="mt-4 font-display text-xl leading-relaxed font-semibold text-balance sm:text-2xl">
                Transformar conhecimento em hospitalidade, pessoas em
                profissionais e experiências em resultados.
              </p>
              <p className="mt-4 leading-relaxed text-white/80">
                Unimos consultoria, educação e conteúdo em um só ecossistema para
                desenvolver pessoas, fortalecer equipes e impulsionar resultados
                em Alimentos & Bebidas.
              </p>
            </article>

            <article className="reveal rounded-3xl border border-line bg-surface-soft p-10">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Visão
              </span>
              <p className="mt-4 font-display text-xl leading-relaxed font-semibold text-balance text-brand-blue sm:text-2xl">
                Ser referência em gastronomia, hospitalidade e gestão de A&B.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                Apoiar a evolução de pessoas, profissionais e empreendedores que
                encontram na gastronomia uma forma de criar, servir e
                transformar.
              </p>
            </article>
          </Container>
        </section>

        {/* VALORES */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                No que acreditamos
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Nossos valores
              </h2>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:auto-rows-fr lg:grid-cols-6">
              {VALORES.map((v, i) => (
                <article
                  key={v.titulo}
                  className={`reveal h-full rounded-2xl border border-line bg-white p-7 lg:col-span-2 ${
                    i === 3 ? "lg:col-start-2" : ""
                  }`}
                >
                  <h3 className="font-display text-lg font-bold text-brand-blue">
                    {v.titulo}
                  </h3>
                  <p className="mt-3 leading-relaxed text-muted">{v.texto}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* PILARES H·C·E */}
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                O que o nome carrega
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Hospitalidade, Consultoria e Educação
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PILARES.map((p) => (
                <article
                  key={p.titulo}
                  className="reveal group flex flex-col rounded-2xl border border-line bg-surface-soft p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none"
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

        {/* CTA FINAL */}
        <section className="bg-brand-blue py-20 text-white sm:py-24">
          <Container className="text-center">
            <h2 className="font-display text-3xl font-bold text-brand-amber sm:text-4xl">
              Como a HCE pode contribuir com você?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Conheça as soluções que desenvolvemos para pessoas e negócios da
              gastronomia.
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
