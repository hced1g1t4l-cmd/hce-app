import type { Metadata } from "next";
import type { SVGProps } from "react";
import Image from "next/image";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TexturaAzul } from "@/components/site/textura-azul";

export const metadata: Metadata = {
  title: "Na Mídia · HCE",
  description:
    "Conteúdos de Cris Leite e Gio Gropello na imprensa e nas redes: coluna, podcast, entrevistas e participações sobre gastronomia, hospitalidade e gestão.",
  alternates: { canonical: "/na-midia" },
  openGraph: {
    title: "Na Mídia · HCE",
    description:
      "Onde os fundadores da HCE aparecem: coluna no Extra, o podcast Cada mesa, uma história e outras participações sobre gastronomia e hospitalidade.",
    url: "/na-midia",
  },
};

// Tipos de conteúdo. Cada valor tem um ícone e um gradiente próprios (ver mapa
// abaixo), então ao adicionar um novo tipo lembre de cobri-lo em TIPO_ICONE.
type MidiaTipo = "Coluna" | "Podcast" | "Entrevista" | "Vídeo" | "Artigo";

type LinkExtra = { label: string; url: string };

type ItemMidia = {
  tipo: MidiaTipo;
  veiculo: string;
  autor: "Cris Leite" | "Gio Gropello";
  titulo: string;
  descricao: string;
  url: string;
  linksExtras?: LinkExtra[];
  // Thumbnail real do conteúdo (imagem local em /public/brand/midia). Opcional:
  // sem ela, o card cai no cabeçalho de gradiente + ícone da marca (fallback).
  thumb?: string;
  // Posição do object-cover da thumb (ex.: "center 22%" para focar o rosto).
  thumbPos?: string;
  // Avatar redondo do autor (foto local em /public/brand/fotos) — dá o ar de
  // "post de rede social" e é 100% confiável (não depende de fonte externa).
  avatar?: string;
};

// Catálogo editável. Para incluir um novo conteúdo, basta adicionar um objeto
// aqui — a página cresce sozinha (o grid se auto-organiza). Itens mais recentes
// primeiro. Para uma thumbnail real, salve a imagem em /public/brand/midia e
// aponte em `thumb`; sem isso, o card usa o cabeçalho de marca como fallback.
const ITENS: ItemMidia[] = [
  {
    tipo: "Coluna",
    veiculo: "Extra · O Globo",
    autor: "Cris Leite",
    titulo: "Coluna da Chef Cris Leite",
    descricao:
      "A coluna da chef Cris Leite no Extra, com bastidores, receitas e reflexões sobre cozinha e gestão.",
    url: "https://extra.globo.com/blogs/chef-cris-leite/post/2026/08/abrimos-uma-cozinha-no-extra.ghtml",
    thumb: "/brand/midia/coluna-cris.jpg",
    thumbPos: "center 22%",
    avatar: "/brand/fotos/chef-cris-4.png",
  },
  {
    tipo: "Podcast",
    veiculo: "Instagram / Podcast",
    autor: "Gio Gropello",
    titulo: "Cada mesa, uma história",
    descricao:
      "Podcast apresentado por Gio Gropello: histórias por trás das mesas, da gastronomia e da hospitalidade.",
    url: "https://www.instagram.com/cadamesaumahistoria/",
    linksExtras: [
      { label: "Linktree", url: "https://linktr.ee/cadamesaumahistoria" },
      { label: "Site", url: "https://cadamesaumahistoria.my.canva.site/" },
    ],
    // Sem thumb: as fontes de imagem do podcast (Instagram, Linktree, Canva)
    // ou bloqueiam o acesso ou não expõem uma capa boa, então este card usa o
    // cabeçalho de gradiente + ícone de microfone como thumbnail (fallback).
    avatar: "/brand/fotos/chef-gio-5.png",
  },
];

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

function IconMicrofone(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </IconBase>
  );
}

function IconJornal(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h13v14H5a2 2 0 0 1-2-2V6" />
      <path d="M17 8h3v9a2 2 0 0 1-2 2" />
      <path d="M7 9h6" />
      <path d="M7 13h6" />
      <path d="M7 17h4" />
    </IconBase>
  );
}

function IconEntrevista(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h16v11H8l-4 4z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </IconBase>
  );
}

function IconVideo(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 10 6-3v10l-6-3z" />
    </IconBase>
  );
}

function IconArtigo(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </IconBase>
  );
}

function LinkExterno(props: IconProps) {
  return (
    <IconBase {...props} strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

// Ícone + gradiente do cabeçalho por tipo de conteúdo. Sem imagens externas:
// tudo desenhado com a paleta da marca para não quebrar por CORS/hotlink.
const TIPO_ICONE: Record<
  MidiaTipo,
  { Icone: (props: IconProps) => React.ReactElement; gradiente: string }
> = {
  Coluna: {
    Icone: IconJornal,
    gradiente: "from-brand-blue to-brand-blue-deep",
  },
  Podcast: {
    Icone: IconMicrofone,
    gradiente: "from-brand-blue-deep to-brand-blue",
  },
  Entrevista: {
    Icone: IconEntrevista,
    gradiente: "from-brand-blue to-brand-blue-deep",
  },
  Vídeo: {
    Icone: IconVideo,
    gradiente: "from-brand-blue-deep to-brand-blue",
  },
  Artigo: {
    Icone: IconArtigo,
    gradiente: "from-brand-blue to-brand-blue-deep",
  },
};

export default function NaMidiaPage() {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* INTRO */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-16 text-white sm:py-20">
          <TexturaAzul src="/brand/texturas/textura-cozinha-3.jpg" opacidade={0.16} veu={0} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <Container className="relative text-center">
            <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
              Na Mídia
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold text-balance text-white sm:text-5xl">
              A HCE por aí: coluna, podcast e entrevistas
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Reunimos aqui os conteúdos de Cris Leite e Gio Gropello na imprensa
              e nas redes — cozinha, hospitalidade e gestão em diferentes
              formatos. Novos materiais entram nesta página com o tempo.
            </p>
          </Container>
        </section>

        {/* GRID DE CONTEÚDOS — cards no estilo "post de rede social".
            O grid usa auto-fit: com 2 itens ele centraliza (sem card órfão) e,
            à medida que novos conteúdos entram no array ITENS, ganha colunas
            sozinho (até 3 por linha), mantendo tudo alinhado ao centro. */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            <div className="mx-auto grid max-w-5xl justify-center gap-8 [grid-template-columns:repeat(auto-fit,minmax(300px,360px))]">
              {ITENS.map((item) => {
                const { Icone, gradiente } = TIPO_ICONE[item.tipo];
                return (
                  <article
                    key={item.url}
                    className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-brand transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-brand-lg motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    {/* TOPO: thumbnail real do conteúdo (proporção fixa 16/9).
                        Sem thumbnail, cai no cabeçalho de marca (gradiente +
                        ícone do tipo) para nunca quebrar o layout. */}
                    <div className="relative aspect-video w-full overflow-hidden bg-brand-blue">
                      {item.thumb ? (
                        <Image
                          src={item.thumb}
                          alt={item.titulo}
                          fill
                          sizes="(max-width: 640px) 90vw, 360px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                          style={{ objectPosition: item.thumbPos ?? "center" }}
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradiente}`}
                        >
                          <div
                            aria-hidden
                            className="hce-hero-pattern pointer-events-none absolute inset-0 opacity-40"
                          />
                          <span
                            aria-hidden
                            className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-amber ring-1 ring-white/15 transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
                          >
                            <Icone className="h-8 w-8" />
                          </span>
                        </div>
                      )}

                      {/* Gradiente escuro na base: profundidade e contraste. */}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"
                      />

                      {/* Badge do tipo (pílula âmbar) no canto superior. */}
                      <span className="absolute top-4 left-4 z-10 rounded-full bg-brand-amber px-3 py-1 font-display text-xs font-semibold text-brand-blue-deep shadow-brand">
                        {item.tipo}
                      </span>

                      {/* Rótulo do veículo sobre a base da imagem. */}
                      <span className="absolute bottom-3 left-4 z-10 font-display text-xs font-semibold tracking-wide text-white/95 drop-shadow">
                        {item.veiculo}
                      </span>
                    </div>

                    {/* CORPO */}
                    <div className="flex flex-1 flex-col p-6">
                      {/* Linha do autor: avatar redondo + nome + veículo. */}
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <Image
                            src={item.avatar}
                            alt={item.autor}
                            width={40}
                            height={40}
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-brand"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue font-display text-sm font-bold text-brand-amber ring-2 ring-white shadow-brand"
                          >
                            {item.autor
                              .split(" ")
                              .map((p) => p[0])
                              .join("")}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-display text-sm font-semibold text-brand-blue">
                            {item.autor}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {item.veiculo}
                          </p>
                        </div>
                      </div>

                      <h2 className="mt-4 font-display text-lg font-bold text-brand-blue">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${item.titulo} — ${item.tipo} de ${item.autor} (abre em nova aba)`}
                          className="underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline focus-visible:decoration-brand-amber"
                        >
                          {item.titulo}
                        </a>
                      </h2>
                      <p className="mt-2 flex-1 leading-relaxed text-muted">
                        {item.descricao}
                      </p>

                      {/* RODAPÉ: CTA + chips dos links extras (acima do overlay). */}
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                        <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-brand-amber-dark transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none">
                          Ver conteúdo
                          <LinkExterno className="h-4 w-4" />
                        </span>

                        {item.linksExtras && item.linksExtras.length > 0 && (
                          <div className="relative z-10 flex flex-wrap gap-2">
                            {item.linksExtras.map((lk) => (
                              <a
                                key={lk.url}
                                href={lk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${lk.label} de ${item.titulo} (abre em nova aba)`}
                                className="rounded-full border border-line px-3 py-1 font-display text-xs font-semibold text-brand-blue transition-colors hover:border-brand-amber hover:text-brand-amber-dark"
                              >
                                {lk.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
