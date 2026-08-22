import Link from "next/link";
import { Container } from "@/components/site/container";
import { Logo } from "@/components/site/logo";
import { SocialLinks } from "@/components/site/social-links";
import { TexturaAzul } from "@/components/site/textura-azul";
import { EMAIL_CONTATO } from "@/lib/site";

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-brand-blue-deep text-white/80">
      <TexturaAzul
        src="/brand/texturas/textura-cozinha-1.jpg"
        opacidade={0.07}
      />
      <Container className="relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <Logo
            variant="light"
            size={64}
            href="/"
            className="drop-shadow-[0_4px_14px_rgba(0,0,0,0.3)]"
          />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            As experiências de Cris Leite e Gio Gropello reunidas para
            desenvolver pessoas, fortalecer equipes e impulsionar resultados no
            setor de Alimentos e Bebidas.
          </p>
          {/* FAB_007: caminhos para as redes sociais. */}
          <SocialLinks className="mt-6" />
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold tracking-wide text-white uppercase">
            Navegação
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href="/quem-somos" className="hover:text-brand-amber">
                Sobre a HCE
              </Link>
            </li>
            <li>
              <Link href="/servicos" className="hover:text-brand-amber">
                O que fazemos
              </Link>
            </li>
            <li>
              <Link href="/feed" className="hover:text-brand-amber">
                Feed HCE
              </Link>
            </li>
            <li>
              <Link href="/na-midia" className="hover:text-brand-amber">
                Na Mídia
              </Link>
            </li>
            <li>
              <Link href="/podcast" className="hover:text-brand-amber">
                Podcast
              </Link>
            </li>
            <li>
              <Link href="/clube" className="hover:text-brand-amber">
                +HCE
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-brand-amber">
                Perguntas frequentes
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
                href={`mailto:${EMAIL_CONTATO}`}
                className="transition-colors hover:text-brand-amber"
              >
                {EMAIL_CONTATO}
              </a>
            </li>
            <li>
              <Link
                href="/fale-com-a-hce"
                className="transition-colors hover:text-brand-amber"
              >
                Fale com a HCE
              </Link>
            </li>
            <li className="text-white/60">Rio de Janeiro, Brasil</li>
          </ul>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-center gap-4 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          {/* RAF_010: "Desenvolvido por rqtte" como continuacao do copyright. */}
          <span className="order-2 text-center sm:order-1 sm:text-left">
            © {YEAR} HCE Gastronomia. Todos os direitos reservados. Desenvolvido
            por{" "}
            <a
              href="https://rqtte.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/70 transition-colors hover:text-brand-amber"
            >
              rqtte
            </a>
          </span>
          <nav
            aria-label="Documentos legais"
            className="order-1 flex items-center gap-4 sm:order-2"
          >
            <Link
              href="/termos-de-uso"
              className="transition-colors hover:text-brand-amber"
            >
              Termos de Uso
            </Link>
            <span aria-hidden className="text-white/25">
              ·
            </span>
            <Link
              href="/privacidade"
              className="transition-colors hover:text-brand-amber"
            >
              Aviso de Privacidade
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
