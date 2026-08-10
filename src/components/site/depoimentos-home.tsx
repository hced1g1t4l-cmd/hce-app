"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Depoimento = {
  nome: string;
  cargo: string;
  foto: string;
  texto: string;
};

// Depoimentos de pessoas que estudaram/trabalharam com a Cris e o Gio (BAC_110).
const DEPOIMENTOS: Depoimento[] = [
  {
    nome: "Gabriel Monteiro de Abreu Coutinho",
    cargo: "Chef e proprietário · Atelier Coutinho",
    foto: "/brand/depoimentos/gabriel-monteiro.jpg",
    texto:
      "Tive o privilégio de ter Giovani e Cris como meus mestres na graduação em Gastronomia e posso dizer, com toda certeza, que são dois dos profissionais mais competentes, dedicados e generosos que já conheci. O que mais me marcou em toda essa experiência foi a forma como ambos conseguem unir muita excelência técnica a uma paixão genuína por ensinar. Isso transformou a maneira como passei a enxergar a gastronomia dali em diante.\n\nMais do que técnicas e receitas, aprendi com eles a ter disciplina, a trabalhar com confiança, a ser extremamente detalhista e a entender que a excelência está nos pequenos cuidados.",
  },
  {
    nome: "Felipe Ruchiga",
    cargo:
      "Gerente de Grupos e Eventos · Le Canton — Ex-chef do Bacalhau & Cia (CADEG)",
    foto: "/brand/depoimentos/felipe-ruchiga.jpg",
    texto:
      "Minha experiência com a Cris Leite, e o que naquele momento era o embrião da HCE, foi extremamente positiva e marcou um momento muito importante da minha trajetória profissional. Durante a inauguração do Bacalhau & Cia, no CADEG, em 2015/2016, toda a experiência da Cris foi fundamental para a estruturação da operação, desde a elaboração do cardápio até o treinamento completo da equipe.\n\nO que mais me chamou a atenção foi a capacidade de transmitir conhecimento de forma prática, organizada e segura. Com sua consultoria, ganhamos confiança para dar continuidade ao trabalho, mantendo o padrão de qualidade que havia sido implantado desde o início.\n\nRecomendo fortemente a HCE para consultorias, treinamentos e mentorias. É um trabalho sério, realizado por profissionais com grande experiência, que realmente fazem a diferença na implantação, no desenvolvimento e na continuidade de qualquer negócio de hospitalidade e gastronomia.",
  },
  {
    nome: "Tauana Torres",
    cargo: "Chef de partie · Ocyá",
    foto: "/brand/depoimentos/tauana-torres.jpg",
    texto:
      "Tive o privilégio de conhecer a HCE em dois momentos muito importantes da minha trajetória: primeiro como aluna e, depois, trabalhando ao lado da Cris e do Gio. Posso dizer que grande parte da profissional que sou hoje foi construída por meio dos ensinamentos, da exigência e do exemplo dos dois.\n\nO que mais me marcou foi a forma como transformam conhecimento técnico em aprendizado prático, sempre incentivando a busca pela excelência, organização e respeito pela profissão. Até hoje aplico diariamente tudo o que aprendi com eles, tanto na parte técnica quanto na postura profissional.\n\nRecomendo a HCE com toda a confiança, porque sei que ali o ensino é verdadeiro, conduzido por profissionais que realmente se dedicam a formar pessoas preparadas para o mercado e apaixonadas pela gastronomia.",
  },
  {
    nome: "Cássio Ayres",
    cargo: "Private chef",
    foto: "/brand/depoimentos/cassio-ayres.jpg",
    texto:
      "Conheço o Giovanni e a Cris há bastante tempo e confio muito na forma como trabalham. Eles unem competência, organização, experiência e um cuidado genuíno com as pessoas. Isso se reflete em conteúdos muito bem estruturados, didáticos e fundamentados tanto na técnica quanto na prática. Tenho certeza de que a HCE nasce com uma base muito sólida e recomendo o trabalho deles com total tranquilidade a quem busca aprendizado de qualidade.",
  },
  {
    nome: "Yuri Andrade de Fonseca Ovidio",
    cargo: "Sócio · Oishi Pastel",
    foto: "/brand/depoimentos/yuri-andrade.jpg",
    texto:
      "Estudar com os professores Gio e Cris foi uma experiência extraordinária. A paixão deles pelo ensino e o domínio dos conteúdos tornaram cada aula envolvente e inspiradora. Eles sempre incentivaram a participação e o debate, o que me permitiu aprofundar meu conhecimento e desenvolver novas habilidades. A forma como apresentaram os temas, tornando-os acessíveis e relevantes, fez toda a diferença na minha jornada de aprendizado.\n\nSou grato por ter tido a oportunidade de aprender com profissionais tão dedicados e competentes.",
  },
  {
    nome: "Leonardo Dourado",
    cargo:
      "Proprietário · Produto Artesanal — Comércio e Fabricação de Alimentos (RJ)",
    foto: "/brand/depoimentos/leonardo-dourado.jpg",
    texto:
      "Tenho muita gratidão pela oportunidade de aprender com a Cris Leite e o Gio Gropello ao longo da minha formação. Conheço a Cris desde 2016, quando foi minha professora na graduação, e posteriormente também na pós-graduação. Sempre admirei o conhecimento, a dedicação e a forma inspiradora com que ambos compartilham suas experiências.\n\nOs aprendizados recebidos contribuíram muito para minha visão da gastronomia e para meu crescimento profissional. Recomendo a HCE pela excelência dos professores e pela qualidade do ensino oferecido.",
  },
  {
    nome: "Luckas Hermann Terra (Bruce Kind)",
    cargo: "Pesquisador e doutorando · UFRJ",
    foto: "/brand/depoimentos/bruce-kind.jpg",
    texto:
      "Cris e Gio foram meus professores na minha segunda graduação. Durante a minha vida, já fiz duas graduações, diversos cursos e especializações; não falo isso para me gabar, mas para dizer que, de todos os lugares por onde já passei, sem dúvida, eles foram os melhores professores que já tive! A forma de ensinar é totalmente fora da curva. Dava para ver como eles se dedicam ao planejamento das disciplinas, a produzir e testar as fichas técnicas antes das aulas, além de estarem sempre atualizados, buscando novidades para os alunos.\n\nAtualmente, trabalho em um projeto que demanda conhecimentos sobre consultoria, gestão de alimentos e bebidas e elaboração de fichas técnicas; sempre que tenho uma dúvida, são as consultas aos materiais que eles produziram que me salvam. Recomendo a HCE de olhos fechados, pois confio na qualidade do seu conteúdo e de quem o ensina.",
  },
  {
    nome: "Ricardo Louveira",
    cargo: "Chef executivo · Sushi da Praça",
    foto: "/brand/depoimentos/ricardo-louveira.jpg",
    texto:
      "O que mais me chamou a atenção no trabalho da HCE foi a responsabilidade e o profissionalismo demonstrados ao longo de todo o processo. Tive um desenvolvimento técnico significativo, que me permitiu adquirir uma nova perspectiva sobre atividades que eu já realizava há anos, aprimorando minha postura, minha organização e a forma de trabalhar com os insumos locais. Eu recomendo a HCE porque a empresa é formada por pessoas em quem confio e que demonstram alta competência no que se propõem a fazer.",
  },
];

function Aspas() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-8 w-8 shrink-0 text-brand-amber"
      fill="currentColor"
    >
      <path d="M9.5 6C6.46 6 4 8.46 4 11.5V18h6v-6H7.2c0-1.55 1.05-2.8 2.3-2.8V6zm10 0C16.46 6 14 8.46 14 11.5V18h6v-6h-2.8c0-1.55 1.05-2.8 2.3-2.8V6z" />
    </svg>
  );
}

function Avatar({ d, tamanho = 14 }: { d: Depoimento; tamanho?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={d.foto}
      alt={d.nome}
      loading="lazy"
      style={{ width: tamanho * 4, height: tamanho * 4 }}
      className="shrink-0 rounded-full object-cover object-top ring-2 ring-brand-amber/40"
    />
  );
}

// Card de altura fixa: todos iguais. O texto é limitado (line-clamp) e o
// completo abre num modal, sem perder conteúdo nem quebrar o alinhamento.
function Card({ d, onAbrir }: { d: Depoimento; onAbrir: () => void }) {
  const longo = d.texto.length > 260;
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-brand transition-shadow duration-300 hover:shadow-brand-lg">
      <Aspas />
      <blockquote className="mt-3 line-clamp-6 leading-relaxed whitespace-pre-line text-ink">
        {d.texto}
      </blockquote>
      {longo && (
        <button
          type="button"
          onClick={onAbrir}
          className="mt-2 self-start text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-deep"
        >
          Ler mais
        </button>
      )}
      <figcaption className="mt-auto flex items-center gap-3.5 border-t border-line pt-5">
        <Avatar d={d} />
        <div className="min-w-0">
          <p className="font-display font-bold text-brand-blue">{d.nome}</p>
          <p className="text-sm leading-snug text-muted">{d.cargo}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Seta({ dir }: { dir: "esq" | "dir" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "esq" ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export function DepoimentosHome() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [inicio, setInicio] = useState(true);
  const [fim, setFim] = useState(false);
  const [modal, setModal] = useState<Depoimento | null>(null);

  const passo = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const largura = slide?.offsetWidth ?? el.clientWidth;
    return largura + 24; // + gap-6
  }, []);

  const atualizar = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const p = passo() || 1;
    setAtivo(Math.round(el.scrollLeft / p));
    setInicio(el.scrollLeft <= 2);
    setFim(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, [passo]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    atualizar();
    el.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    return () => {
      el.removeEventListener("scroll", atualizar);
      window.removeEventListener("resize", atualizar);
    };
  }, [atualizar]);

  const mover = useCallback(
    (dir: 1 | -1) => {
      scrollerRef.current?.scrollBy({ left: dir * passo(), behavior: "smooth" });
    },
    [passo],
  );

  const irPara = useCallback(
    (i: number) => {
      scrollerRef.current?.scrollTo({ left: i * passo(), behavior: "smooth" });
    },
    [passo],
  );

  // Fecha o modal com Esc.
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  return (
    <div className="mt-14">
      <div
        role="region"
        aria-roledescription="carrossel"
        aria-label="Depoimentos"
        className="relative"
      >
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {DEPOIMENTOS.map((d) => (
            <div
              key={d.nome}
              data-slide
              className="h-[23rem] w-full shrink-0 snap-start sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <Card d={d} onAbrir={() => setModal(d)} />
            </div>
          ))}
        </div>
      </div>

      {/* CONTROLES */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => mover(-1)}
          disabled={inicio}
          aria-label="Depoimentos anteriores"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue shadow-brand transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Seta dir="esq" />
        </button>

        <div className="flex items-center gap-2">
          {DEPOIMENTOS.map((d, i) => (
            <button
              key={d.nome}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ir para o depoimento ${i + 1}`}
              aria-current={ativo === i ? "true" : undefined}
              className={cn(
                "h-2.5 rounded-full transition-all",
                ativo === i
                  ? "w-6 bg-brand-blue"
                  : "w-2.5 bg-line hover:bg-brand-blue/40",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => mover(1)}
          disabled={fim}
          aria-label="Próximos depoimentos"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-brand-blue shadow-brand transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Seta dir="dir" />
        </button>
      </div>

      {/* MODAL — depoimento completo */}
      {modal && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Depoimento de ${modal.nome}`}
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-white p-6 shadow-brand-lg sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Avatar d={modal} tamanho={12} />
                <div className="min-w-0">
                  <p className="font-display font-bold text-brand-blue">
                    {modal.nome}
                  </p>
                  <p className="text-sm leading-snug text-muted">
                    {modal.cargo}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Fechar"
                className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-surface-soft hover:text-ink"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <Aspas />
            <blockquote className="mt-3 leading-relaxed whitespace-pre-line text-ink">
              {modal.texto}
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
}
