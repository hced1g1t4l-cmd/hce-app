import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TexturaAzul } from "@/components/site/textura-azul";
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

// Áreas de atuação: chamada curta (para os cards) + descrição completa
// (bloco "em detalhe"). Copy oficial — BAC_105 (docs de ajuste do "O que fazemos").
const SERVICOS = [
  {
    titulo: "Diagnóstico operacional e consultoria em A&B",
    texto:
      "Gestão, processos e qualidade, com um plano de ação claro e priorizado.",
    modelos: ["Projeto", "Recorrente"],
    descricao: [
      "A construção de um serviço de excelência exige mais do que boa vontade. É necessário compreender como a operação funciona, identificar oportunidades de melhoria, padronizar processos e desenvolver as equipes de forma contínua. Esse é o propósito da HCE: apoiar empresas de alimentação e bebidas por meio de diagnósticos operacionais e consultoria em gestão, processos e qualidade, transformando análises em planos de ação claros, priorizados e voltados para resultados consistentes.",
      "O diagnóstico operacional proporciona uma visão ampla da empresa, permitindo identificar oportunidades de aperfeiçoamento na gestão, nos processos, na qualidade dos serviços e na organização da operação. A partir dessa avaliação, são definidas recomendações estratégicas e práticas, alinhadas às necessidades e aos objetivos de cada negócio.",
      "Ao final da consultoria, a empresa recebe uma visão clara da operação, dos principais desafios e das oportunidades de melhoria, além de um plano de ação estruturado para orientar a tomada de decisões e apoiar a implementação das mudanças recomendadas.",
      "O trabalho da HCE busca fortalecer a gestão, tornar os processos mais eficientes, desenvolver equipes, elevar os padrões de qualidade e contribuir para operações mais organizadas, competitivas e sustentáveis.",
    ],
  },
  {
    titulo: "Engenharia e elaboração de cardápio",
    texto:
      "Criação e reestruturação de cardápios com ficha técnica, precificação e foco em rentabilidade.",
    modelos: ["Projeto"],
    descricao: [
      "O cardápio é uma das principais ferramentas de gestão de um empreendimento gastronômico. Além de representar a identidade do negócio, influencia a operação, o controle de custos, a experiência do cliente e os resultados financeiros.",
      "A HCE desenvolve projetos de criação e reestruturação de cardápios alinhados ao conceito do estabelecimento, ao perfil do público e aos objetivos da empresa. Cada projeto busca integrar criatividade, viabilidade operacional e desempenho econômico, tornando o cardápio um instrumento estratégico para a gestão.",
      "O serviço contempla a elaboração de receitas padronizadas, a definição de custos e preços de venda, a análise da composição do cardápio e a organização das informações necessárias para uma operação mais eficiente e segura.",
      "Ao final do projeto, a empresa recebe um cardápio estruturado, acompanhado de receitas padronizadas e critérios de precificação que contribuem para o controle da operação, a redução de desperdícios, a padronização da produção e o aumento da rentabilidade.",
    ],
  },
  {
    titulo: "Padronização de processos e receitas",
    texto:
      "Receitas padronizadas, Procedimentos Operacionais Padronizados (POPs) e controle de qualidade para garantir consistência em escala.",
    modelos: ["Projeto", "In company"],
    descricao: [
      "Operações eficientes dependem de processos claros e bem definidos. A padronização reduz falhas, facilita o treinamento das equipes, assegura a qualidade dos produtos e contribui para que os resultados sejam reproduzidos com consistência, independentemente do profissional responsável pela execução.",
      "A HCE desenvolve projetos de padronização operacional adaptados à realidade de cada negócio, estruturando documentos técnicos que orientam a produção, organizam os processos e fortalecem os controles internos.",
      "O serviço contempla a elaboração de receitas padronizadas, Procedimentos Operacionais Padronizados (POPs), controles de qualidade e demais documentos operacionais necessários para tornar a produção mais organizada, segura e eficiente.",
      "Ao final do projeto, a empresa dispõe de um sistema de padronização que facilita a gestão da cozinha, promove maior previsibilidade operacional, reduz desperdícios, fortalece a segurança dos alimentos e contribui para a manutenção dos padrões de qualidade.",
    ],
  },
  {
    titulo: "Gestão de custos e resultados (CMV)",
    texto:
      "Controle de CMV, redução de desperdícios e indicadores de desempenho para uma operação mais rentável.",
    modelos: ["Projeto", "Recorrente"],
    descricao: [
      "A rentabilidade de um negócio gastronômico depende do equilíbrio entre custos, eficiência operacional e qualidade dos produtos oferecidos. Controlar o Custo da Mercadoria Vendida (CMV) é essencial para preservar a margem de lucro e apoiar decisões estratégicas.",
      "A HCE auxilia empresas de alimentação e bebidas na organização dos controles gerenciais, promovendo uma gestão mais eficiente dos custos e dos indicadores de desempenho. O serviço contribui para identificar oportunidades de otimização, reduzir desperdícios e fortalecer o controle financeiro da operação.",
      "A consultoria contempla a análise do CMV, dos processos relacionados ao consumo de insumos e dos principais indicadores que influenciam os resultados do negócio, permitindo uma visão mais clara da operação e de seu desempenho econômico.",
      "Ao final do serviço, a empresa dispõe de informações mais consistentes para apoiar a tomada de decisões, melhorar o controle dos custos, aumentar a produtividade e fortalecer a rentabilidade de forma sustentável.",
    ],
  },
  {
    titulo: "Treinamento de equipes",
    texto:
      "Treinamentos in company para cozinha e salão, do técnico ao comportamental, com foco em desempenho.",
    modelos: ["In company"],
    descricao: [
      "O desempenho de uma equipe influencia diretamente a qualidade dos serviços, a produtividade da operação e a experiência do cliente. Investir na capacitação dos colaboradores é fortalecer a cultura organizacional e promover maior segurança, eficiência e padronização nas atividades do dia a dia.",
      "A HCE desenvolve treinamentos personalizados para equipes de cozinha e salão, alinhados às necessidades de cada empresa e aos objetivos do negócio. Os conteúdos integram aspectos técnicos, operacionais e comportamentais, contribuindo para o desenvolvimento de competências essenciais ao desempenho profissional.",
      "Os programas podem abordar temas relacionados à hospitalidade, atendimento, liderança, trabalho em equipe, segurança dos alimentos, boas práticas de manipulação, padronização de processos, organização da operação, comunicação e outros assuntos estratégicos para o setor de alimentos e bebidas.",
      "Ao final do treinamento, a empresa conta com equipes mais preparadas para atuar de forma integrada, fortalecendo a qualidade dos serviços, a eficiência operacional e a satisfação dos clientes.",
    ],
  },
  {
    titulo: "Hospitalidade e experiência do cliente",
    texto:
      "Cultura de serviço, atendimento e fidelização, transformando a experiência do cliente em um diferencial competitivo.",
    modelos: ["In company", "Palestra"],
    descricao: [
      "A qualidade do atendimento é resultado de uma cultura organizacional que valoriza o serviço, a comunicação e o relacionamento com o cliente. Empresas que investem em hospitalidade fortalecem sua reputação, ampliam a fidelização e constroem relações mais duradouras com o público.",
      "A HCE auxilia organizações a desenvolver uma cultura de serviço alinhada aos valores da empresa e às expectativas de seus clientes. O trabalho integra atendimento, hospitalidade, comportamento profissional e organização da operação, promovendo maior consistência em todos os pontos de contato com o consumidor.",
      "A consultoria contempla ações voltadas ao aprimoramento da jornada do cliente, da comunicação entre as equipes e dos padrões de atendimento, contribuindo para uma experiência mais acolhedora, eficiente e coerente com a identidade do negócio.",
      "Ao final do projeto, a empresa fortalece sua cultura de serviço, desenvolve equipes mais preparadas para o atendimento e transforma a experiência do cliente em um importante diferencial competitivo.",
    ],
  },
  {
    titulo: "Liderança e gestão de pessoas",
    texto:
      "Desenvolvimento de líderes e gestores de A&B para formar equipes de alto desempenho e fortalecer os resultados do negócio.",
    modelos: ["In company", "Mentoria"],
    descricao: [
      "Equipes preparadas começam com uma liderança capaz de orientar, desenvolver e engajar pessoas. Em operações de alimentos e bebidas, o desempenho da equipe está diretamente relacionado à capacidade dos gestores de organizar processos, comunicar objetivos, acompanhar resultados e promover um ambiente de trabalho colaborativo.",
      "A HCE desenvolve programas voltados para a formação de líderes e gestores, fortalecendo competências essenciais para a condução de equipes, a tomada de decisões e a gestão da operação. O trabalho integra aspectos técnicos, comportamentais e estratégicos, preparando profissionais para enfrentar os desafios do setor de forma mais eficiente.",
      "Os programas abordam temas como liderança, comunicação, gestão de equipes, delegação, feedback, resolução de conflitos, desenvolvimento de pessoas, gestão do desempenho e construção de uma cultura organizacional orientada para resultados.",
      "Ao final do processo, a empresa conta com líderes mais preparados para conduzir equipes, fortalecer o desempenho da operação, reduzir a rotatividade e contribuir para um ambiente de trabalho mais produtivo e alinhado aos objetivos do negócio.",
    ],
  },
  {
    titulo: "Cursos, workshops e formação",
    texto:
      "Cursos e workshops de gastronomia, hospitalidade, técnicas de cozinha e gestão, em turmas abertas ou formatos exclusivos para empresas.",
    modelos: ["Curso", "Workshop"],
    descricao: [
      "A atualização profissional é um fator essencial para acompanhar as transformações do setor de alimentos e bebidas. O desenvolvimento contínuo de conhecimentos e competências contribui para aprimorar práticas, fortalecer equipes e ampliar a competitividade de empresas e profissionais.",
      "A HCE oferece cursos, workshops e programas de formação desenvolvidos para atender às demandas do mercado, combinando fundamentação técnica, aplicação prática e conteúdos alinhados às necessidades do setor. As atividades podem ser realizadas em turmas abertas ou em formatos exclusivos para empresas, de acordo com seus objetivos e desafios.",
      "Os programas contemplam temas relacionados à gastronomia, hospitalidade, técnicas de cozinha, gestão, segurança dos alimentos, liderança, atendimento, operação de alimentos e bebidas e outros conteúdos voltados ao desenvolvimento profissional e organizacional.",
      "Ao final de cada formação, os participantes ampliam seus conhecimentos, desenvolvem novas competências e estão mais preparados para aplicar soluções que contribuam para a qualidade dos serviços, o desempenho das equipes e os resultados do negócio.",
    ],
  },
  {
    titulo: "Palestras, mentorias e conteúdo",
    texto:
      "Palestras presenciais e on-line, mentorias e produções autorais desenvolvidas para inspirar, qualificar e transformar a prática profissional.",
    modelos: ["Palestra", "Mentoria"],
    descricao: [
      "O conhecimento é um dos principais instrumentos de transformação no setor de alimentos e bebidas. Compartilhar experiências, discutir tendências e desenvolver competências contribui para a formação de profissionais mais preparados e organizações mais competitivas.",
      "A HCE desenvolve palestras, mentorias e conteúdos autorais voltados para empresas, instituições de ensino, eventos e profissionais que buscam atualização, aperfeiçoamento e desenvolvimento contínuo. Cada atividade é planejada de acordo com o perfil do público e os objetivos da organização, promovendo uma experiência de aprendizagem dinâmica, aplicada e conectada às demandas do mercado.",
      "Os temas abrangem gastronomia, hospitalidade, gestão, liderança, inovação, segurança dos alimentos, operação de alimentos e bebidas e outros assuntos relacionados ao desenvolvimento profissional e organizacional.",
      "Ao final de cada atividade, os participantes ampliam seus conhecimentos, fortalecem sua capacidade de análise e desenvolvem novas perspectivas para aplicar soluções e boas práticas em sua atuação profissional.",
    ],
  },
];

// Modelos de contratação — copy oficial (BAC_105, doc "como contratar").
const MODELOS = [
  {
    nome: "Projeto pontual",
    texto:
      "Indicado para empresas que precisam desenvolver ou implementar uma solução específica, sem acompanhamento permanente. Atende a demandas já identificadas — desenvolvimento de projetos, implantação de processos, criação de materiais técnicos e outras iniciativas voltadas ao aperfeiçoamento da operação e da gestão.",
  },
  {
    nome: "Consultoria recorrente",
    texto:
      "Atendimento contínuo para empresas que buscam aprimorar processos, desenvolver equipes e acompanhar a evolução do negócio ao longo do tempo. De forma estratégica e sistemática, a HCE atua próxima à gestão, identificando oportunidades, propondo soluções e acompanhando a implementação de ações que promovam resultados consistentes e sustentáveis.",
  },
  {
    nome: "In company",
    texto:
      "Treinamentos corporativos personalizados, considerando os desafios, os objetivos estratégicos, a cultura organizacional e as características de cada empresa. Integram conhecimentos técnicos, comportamentais e gerenciais para fortalecer o desempenho das equipes, aprimorar a liderança e promover uma cultura de excelência, com foco em resultados consistentes.",
  },
  {
    nome: "Curso / Workshop",
    texto:
      "Unem conhecimento técnico, experiência prática e abordagem aplicada à realidade do mercado. Desenvolvidos para diferentes públicos e objetivos, oferecem capacitação, atualização e desenvolvimento profissional nas áreas de gastronomia, hospitalidade, gestão e alimentos & bebidas.",
  },
  {
    nome: "Palestra / Mentoria",
    texto:
      "Promovem momentos de aprendizado, reflexão e desenvolvimento, reunindo conhecimento técnico, experiência profissional e visão estratégica. Voltadas a pessoas, estudantes, profissionais, equipes, empresas e organizações, ampliam perspectivas, fortalecem competências e apoiam a tomada de decisões.",
  },
];

export default function ServicosPage() {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* INTRO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-16 text-white sm:py-20">
          <TexturaAzul src="/brand/texturas/textura-cozinha-2.jpg" opacidade={0.16} veu={0} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <div
            aria-hidden
            className="hce-hero-pattern pointer-events-none absolute inset-0"
          />
          <Container className="relative text-center">
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              O que fazemos
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold tracking-tight text-balance text-white sm:text-5xl">
              Consultoria, educação e hospitalidade para A&amp;B
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Contribuímos para a formação de profissionais mais preparados,
              empresas mais qualificadas e experiências mais memoráveis, do
              diagnóstico da operação ao desenvolvimento das pessoas.
            </p>
          </Container>
        </section>

        {/* ÁREAS DE ATUAÇÃO (visão geral) */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Áreas de atuação
              </span>
              <div className="mt-4 flex justify-center">
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
                Como podemos ajudar o seu negócio
              </h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {SERVICOS.map((s, i) => (
                <article
                  key={s.titulo}
                  className="reveal group flex flex-col rounded-2xl border border-line bg-white p-8 shadow-brand transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-brand-lg motion-reduce:transform-none motion-reduce:transition-none"
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

        {/* ÁREAS DE ATUAÇÃO (em detalhe) */}
        <section className="bg-white py-20 sm:py-24">
          <Container className="max-w-3xl">
            <div className="text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Em detalhe
              </span>
              <div className="mt-4 flex justify-center">
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
                Cada serviço, por dentro
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
                Abra cada área para entender o propósito, como trabalhamos e o
                que a sua empresa recebe ao final.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {SERVICOS.map((s) => (
                <details
                  key={s.titulo}
                  className="group rounded-2xl border border-line bg-surface-soft p-6 open:shadow-brand"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold text-brand-blue [&::-webkit-details-marker]:hidden">
                    <span>{s.titulo}</span>
                    <span
                      aria-hidden
                      className="ml-2 shrink-0 text-2xl leading-none text-brand-amber-dark transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <div className="mt-4 space-y-3 leading-relaxed text-muted">
                    <p className="font-medium text-brand-blue">{s.texto}</p>
                    {s.descricao.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </Container>
        </section>

        {/* MODELOS DE CONTRATAÇÃO */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
                Como contratar
              </span>
              <div className="mt-4 flex justify-center">
                <span aria-hidden className="hce-rule" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-brand-blue sm:text-4xl">
                Modelos de contratação
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                Adaptamos o formato ao seu momento e ao seu orçamento. Conte o seu
                desafio e desenhamos a melhor forma de trabalharmos juntos.
              </p>
            </div>

            <div className="mt-14 flex flex-wrap justify-center gap-5">
              {MODELOS.map((m) => (
                <article
                  key={m.nome}
                  className="reveal w-full rounded-2xl border border-line bg-white p-7 shadow-brand sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)]"
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-brand-amber sm:text-4xl">
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
