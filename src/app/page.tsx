import Image from "next/image";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

const PILARES = [
  {
    letra: "h",
    titulo: "Hospitalidade",
    texto:
      "Cultura de serviço que coloca as pessoas no centro. Ajudamos equipes a criar experiências mais humanas e memoráveis, do primeiro contato ao pós-atendimento.",
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
    papel: "Chef e educadora",
    foto: "/brand/fotos/chef-cris.png",
  },
  {
    nome: "Gio Gropello",
    papel: "Chef e consultora",
    foto: "/brand/fotos/chef-gio.png",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1">
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
          <Container className="relative flex flex-col items-center gap-8 py-24 text-center sm:py-32">
            <Image
              src="/brand/logos/logo-hce.png"
              alt="HCE"
              width={360}
              height={150}
              priority
              className="h-24 w-auto sm:h-28"
            />
            <p className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              Hospitalidade · Consultoria · Educação
            </p>
            <h1 className="max-w-3xl font-display text-4xl leading-tight font-extrabold text-balance sm:text-6xl">
              Transformamos restaurantes e formamos pessoas
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/80">
              A HCE nasce da união das trajetórias de Cris Leite e Gio
              Gropello, profissionais que compartilham a paixão pela
              gastronomia, pela educação e pelo desenvolvimento de pessoas.
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button href="#clube" size="lg">
                Conheça o Clube +HCE
              </Button>
              <Button
                href="#servicos"
                size="lg"
                variant="secondary"
                className="border-white/40 text-white hover:bg-white hover:text-brand-blue"
              >
                O que fazemos
              </Button>
            </div>
          </Container>
        </section>

        {/* SOBRE */}
        <section id="sobre" className="bg-white py-24">
          <Container className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Quem somos
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Duas trajetórias, uma paixão pela gastronomia
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                Acreditamos que a hospitalidade, a gestão, a qualidade e a
                gastronomia podem transformar pessoas, equipes e organizações,
                gerando experiências mais significativas e resultados mais
                sustentáveis.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Por isso reunimos consultoria, educação e conteúdo em um só
                ecossistema, para elevar o padrão de quem vive de gastronomia.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {FUNDADORAS.map((f) => (
                <figure
                  key={f.nome}
                  className="group overflow-hidden rounded-2xl border border-line bg-surface-soft"
                >
                  <div className="relative aspect-[4/5] w-full">
                    <Image
                      src={f.foto}
                      alt={`${f.nome}, ${f.papel} da HCE`}
                      fill
                      sizes="(max-width: 768px) 45vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-4">
                    <p className="font-display font-semibold text-brand-blue">
                      {f.nome}
                    </p>
                    <p className="text-sm text-muted">{f.papel}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className="bg-surface-soft py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                O que fazemos
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Cursos, treinamentos e consultoria
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Contribuímos para a formação de profissionais mais preparados,
                empresas mais qualificadas e serviços mais humanos.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {PILARES.map((p) => (
                <article
                  key={p.titulo}
                  className="flex flex-col rounded-2xl border border-line bg-white p-8 transition-shadow hover:shadow-lg"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-blue font-display text-3xl font-extrabold text-brand-amber lowercase">
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
            <div>
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber uppercase">
                Em breve
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Clube +HCE: conteúdo que vira resultado
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/80">
                Um clube por assinatura com receitas, fichas técnicas, aulas e
                uma comunidade para quem quer evoluir na cozinha e na gestão do
                negócio, no seu ritmo.
              </p>
              <ul className="mt-8 space-y-3 text-white/85">
                {[
                  "Biblioteca de receitas e fichas técnicas",
                  "Aulas e treinamentos exclusivos",
                  "Comunidade e trocas com as chefs",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-amber text-sm font-bold text-brand-blue-deep">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-9">
                <Button href="#contato" size="lg">
                  Quero ser avisado do lançamento
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <Image
                  src="/brand/posts/o-que-oferece.jpeg"
                  alt="O que a HCE oferece"
                  width={819}
                  height={1024}
                  className="h-auto w-full"
                />
              </div>
            </div>
          </Container>
        </section>

        {/* CONTATO */}
        <section id="contato" className="bg-white py-24">
          <Container>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-brand-blue-deep px-8 py-16 text-center text-white sm:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 h-64 w-64 rounded-full bg-brand-amber/15 blur-3xl"
              />
              <h2 className="relative font-display text-3xl font-bold text-balance sm:text-4xl">
                Vamos transformar o seu negócio?
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/80">
                Conte para a gente o seu desafio. Consultoria, treinamento para
                a equipe ou uma parceria de conteúdo: a HCE está pronta para
                ajudar.
              </p>
              <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  href="mailto:contato@hcegastronomia.com"
                  size="lg"
                >
                  contato@hcegastronomia.com
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
