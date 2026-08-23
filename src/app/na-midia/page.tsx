import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TexturaAzul } from "@/components/site/textura-azul";
import { CardMidia } from "@/components/site/midia-card";
import { prisma } from "@/lib/db";
import {
  ehMidiaTipo,
  parseLinksExtras,
  type MidiaCard,
} from "@/lib/na-midia";

// Conteúdo agora vem do banco (model MidiaItem), gerenciado em /adm/na-midia
// (BAC_130). A página exibe só os itens publicados, na ordem definida no painel.
export const dynamic = "force-dynamic";

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

export default async function NaMidiaPage() {
  const rows = await prisma.midiaItem.findMany({
    where: { publicado: true },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });

  const itens: MidiaCard[] = rows.map((r) => ({
    id: r.id,
    tipo: ehMidiaTipo(r.tipo) ? r.tipo : "Artigo",
    veiculo: r.veiculo,
    autor: r.autor,
    titulo: r.titulo,
    descricao: r.descricao,
    url: r.url,
    linksExtras: parseLinksExtras(r.linksExtras),
    thumb: r.thumbUrl,
    thumbPos: r.thumbPos,
    avatar: r.avatarUrl,
    logoVeiculo: r.logoVeiculo,
    logoAlt: r.logoAlt,
    logoClasse: r.logoClasse,
  }));

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
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold text-balance text-white sm:text-5xl">
              A HCE por aí: coluna, podcast e entrevistas
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              Reunimos aqui os conteúdos de Cris Leite e Gio Gropello na imprensa
              e nas redes, com cozinha, hospitalidade e gestão em diferentes
              formatos. Novos materiais entram nesta página com o tempo.
            </p>
          </Container>
        </section>

        {/* GRID DE CONTEÚDOS — cards no estilo "post de rede social".
            O grid usa auto-fit: com poucos itens centraliza (sem card órfão) e
            ganha colunas sozinho (até 3 por linha) conforme o painel publica. */}
        <section className="bg-surface-soft py-20 sm:py-24">
          <Container>
            {itens.length === 0 ? (
              <p className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center text-muted shadow-brand">
                Em breve, novos conteúdos por aqui.
              </p>
            ) : (
              <div className="mx-auto grid max-w-5xl justify-center gap-8 [grid-template-columns:repeat(auto-fit,minmax(300px,360px))]">
                {itens.map((item) => (
                  <CardMidia key={item.id} item={item} />
                ))}
              </div>
            )}
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
