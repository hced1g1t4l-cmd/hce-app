import Link from "next/link";
import { Container } from "@/components/site/container";
import { Logo } from "@/components/site/logo";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="bg-brand-blue-deep text-white/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <Logo variant="light" size={38} href="/" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Hospitalidade, Consultoria e Educação em Gastronomia. Unindo as
            trajetórias de Cris Leite e Gio Gropello para transformar
            restaurantes e formar pessoas.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Navegação
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="#sobre" className="hover:text-brand-amber">
                Sobre a HCE
              </Link>
            </li>
            <li>
              <Link href="#servicos" className="hover:text-brand-amber">
                O que fazemos
              </Link>
            </li>
            <li>
              <Link href="#clube" className="hover:text-brand-amber">
                Clube +HCE
              </Link>
            </li>
            <li>
              <Link href="#contato" className="hover:text-brand-amber">
                Contato
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Contato
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href="mailto:contato@hcegastronomia.com"
                className="hover:text-brand-amber"
              >
                contato@hcegastronomia.com
              </a>
            </li>
            <li className="text-white/60">Rio de Janeiro, Brasil</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-white/50 sm:flex-row">
          <span>© {YEAR} HCE Gastronomia. Todos os direitos reservados.</span>
          <span>Feito com dedicação por Cris Leite e Gio Gropello.</span>
        </Container>
      </div>
    </footer>
  );
}
