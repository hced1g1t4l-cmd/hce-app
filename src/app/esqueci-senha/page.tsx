import type { Metadata } from "next";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { EsqueciSenhaForm } from "@/components/site/esqueci-senha-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Esqueci minha senha · HCE",
  robots: { index: false, follow: true },
};

export default function EsqueciSenhaPage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-md">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-brand-blue sm:text-4xl">
              Esqueci minha senha
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Informe o e-mail da sua conta e enviaremos um link para você criar
              uma nova senha.
            </p>
          </div>
          <EsqueciSenhaForm />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
