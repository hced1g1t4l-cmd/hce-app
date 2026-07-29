import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { EntrarForm } from "@/components/site/entrar-form";
import { getSessionUser } from "@/lib/auth-user";
import { googleConfigured } from "@/lib/google-oauth";

const ERROS_GOOGLE: Record<string, string> = {
  google_indisponivel:
    "O login com Google ainda não está ativo. Use e-mail e senha por enquanto.",
  google_cancelado: "Login com Google cancelado. Você pode tentar de novo.",
  google_email:
    "Não foi possível confirmar o e-mail da sua conta Google. Tente outra conta.",
  google_falhou:
    "Não foi possível entrar com o Google agora. Tente novamente em instantes.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Entrar · HCE",
  description: "Acesse sua conta HCE.",
  robots: { index: false, follow: true },
};

function destino(red?: string): string {
  return red && red.startsWith("/") && !red.startsWith("//") ? red : "/conta";
}

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; erro?: string }>;
}) {
  const { redirect: red, erro } = await searchParams;
  if (await getSessionUser()) redirect(destino(red));

  const aviso = erro ? (ERROS_GOOGLE[erro] ?? null) : null;

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-md">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-brand-blue sm:text-4xl">
              Entrar
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Acesse sua conta para ler o Feed HCE e acompanhar as novidades.
            </p>
          </div>
          <EntrarForm
            redirect={red}
            googleHabilitado={googleConfigured()}
            aviso={aviso}
          />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
