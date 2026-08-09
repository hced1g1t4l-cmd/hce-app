import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TexturaAzul } from "@/components/site/textura-azul";

export type LegalSecao = {
  id: string;
  titulo: string;
  conteudo: ReactNode;
};

// Layout compartilhado dos documentos jurídicos (Termos de Uso e Aviso de
// Privacidade): capa, metadados de vigência, índice navegável e as cláusulas.
export function LegalLayout({
  eyebrow,
  titulo,
  resumo,
  atualizacao,
  versao,
  secoes,
  rodape,
}: {
  eyebrow: string;
  titulo: string;
  resumo: string;
  atualizacao: string;
  versao: string;
  secoes: LegalSecao[];
  rodape?: ReactNode;
}) {
  return (
    <>
      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {/* CAPA */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-blue to-brand-blue-deep py-16 text-white sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-amber/15 blur-3xl"
          />
          <div
            aria-hidden
            className="hce-hero-pattern pointer-events-none absolute inset-0"
          />
          <TexturaAzul
            src="/brand/texturas/textura-cozinha-3.jpg"
            opacidade={0.08}
          />
          <Container className="relative max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="font-display text-sm font-semibold tracking-[0.28em] text-brand-amber uppercase">
                {eyebrow}
              </span>
              <span aria-hidden className="hce-rule" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance text-white sm:text-5xl">
              {titulo}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
              {resumo}
            </p>
            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <dt className="font-semibold text-brand-amber">
                  Última atualização:
                </dt>
                <dd>{atualizacao}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="font-semibold text-brand-amber">Versão:</dt>
                <dd>{versao}</dd>
              </div>
            </dl>
          </Container>
        </section>

        {/* CORPO + ÍNDICE */}
        <section className="bg-surface-soft py-16 sm:py-20">
          <Container className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            {/* Índice */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav aria-label="Índice do documento">
                <p className="font-display text-xs font-semibold tracking-widest text-brand-amber-dark uppercase">
                  Índice
                </p>
                {/* Mobile: recolhível para não empurrar o conteúdo. */}
                <details className="mt-3 lg:hidden">
                  <summary className="cursor-pointer rounded-lg border border-line bg-white px-4 py-2.5 font-display text-sm font-semibold text-brand-blue [&::-webkit-details-marker]:hidden">
                    Ver seções
                  </summary>
                  <ol className="mt-3 space-y-2 text-sm">
                    {secoes.map((s, i) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="text-muted transition-colors hover:text-brand-blue"
                        >
                          <span className="text-brand-amber-dark">{i + 1}.</span>{" "}
                          {s.titulo}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
                {/* Desktop: lista fixa. */}
                <ol className="mt-4 hidden space-y-2.5 text-sm lg:block">
                  {secoes.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-muted transition-colors hover:text-brand-blue"
                      >
                        <span className="text-brand-amber-dark">{i + 1}.</span>{" "}
                        {s.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>

            {/* Cláusulas */}
            <div>
              <article className="materia max-w-none rounded-2xl border border-line bg-white p-6 shadow-brand sm:p-10">
                {secoes.map((s, i) => (
                  <section key={s.id} id={s.id} className="scroll-mt-28">
                    <h2>
                      {i + 1}. {s.titulo}
                    </h2>
                    {s.conteudo}
                  </section>
                ))}
                {rodape ? (
                  <p className="mt-10 border-t border-line pt-6 text-sm text-muted">
                    {rodape}
                  </p>
                ) : null}
              </article>

              <p className="mt-8 text-center text-sm text-muted">
                Veja também o{" "}
                <Link
                  href="/termos-de-uso"
                  className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-amber-dark"
                >
                  Termos de Uso
                </Link>{" "}
                e o{" "}
                <Link
                  href="/privacidade"
                  className="font-semibold text-brand-blue underline underline-offset-2 hover:text-brand-amber-dark"
                >
                  Aviso de Privacidade
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
