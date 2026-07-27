import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CriarContaForm } from "@/components/site/criar-conta-form";
import { getSessionUser } from "@/lib/auth-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Criar conta grátis · HCE",
  description:
    "Crie sua conta gratuita na HCE e desbloqueie o Feed HCE, com artigos e conteúdos exclusivos sobre gastronomia e hospitalidade.",
  robots: { index: false, follow: true },
};

function destino(red?: string): string {
  return red && red.startsWith("/") && !red.startsWith("//") ? red : "/conta";
}

export default async function CriarContaPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: red } = await searchParams;
  if (await getSessionUser()) redirect(destino(red));

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-xl">
          <div className="text-center">
            <span className="font-display text-sm font-semibold tracking-widest text-brand-amber-dark uppercase">
              Conta gratuita
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold text-balance text-brand-blue sm:text-4xl">
              Crie sua conta grátis
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Com a conta gratuita você desbloqueia o{" "}
              <strong className="text-brand-blue">Feed HCE</strong> — artigos e
              conteúdos sobre gastronomia, hospitalidade e gestão. Leva menos de
              um minuto.
            </p>
          </div>
          <CriarContaForm redirect={red} />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
