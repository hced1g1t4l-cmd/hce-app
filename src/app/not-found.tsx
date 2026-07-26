import Link from "next/link";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-gradient-to-b from-brand-blue to-brand-blue-deep text-white">
        <Container className="flex flex-col items-center gap-6 py-28 text-center">
          <p className="font-display text-7xl font-extrabold text-brand-amber sm:text-8xl">
            404
          </p>
          <h1 className="font-display text-2xl font-bold text-brand-amber sm:text-3xl">
            Essa página saiu do cardápio
          </h1>
          <p className="max-w-md text-white/80">
            O endereço que você tentou acessar não existe ou foi movido. Que tal
            voltar para o início?
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button href="/" size="lg">
              Voltar para o início
            </Button>
            <Button
              href="/fale-com-a-hce"
              size="lg"
              variant="secondary"
              className="border-brand-amber/70 text-brand-amber hover:border-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep"
            >
              Fale com a HCE
            </Button>
          </div>
          <Link
            href="/"
            className="mt-2 text-sm text-white/50 underline-offset-4 hover:text-brand-amber hover:underline"
          >
            hcegastronomia.com
          </Link>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
