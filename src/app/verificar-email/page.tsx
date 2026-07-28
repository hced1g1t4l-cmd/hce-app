import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SairButton } from "@/components/site/sair-button";
import { VerificarEmail } from "@/components/site/verificar-email";
import { getSessionUser } from "@/lib/auth-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Confirme seu e-mail · HCE",
  robots: { index: false, follow: false },
};

function destino(apos?: string): string {
  return apos && apos.startsWith("/") && !apos.startsWith("//") ? apos : "/conta";
}

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ apos?: string }>;
}) {
  const user = await getSessionUser();
  // Sem sessão: precisa entrar/cadastrar primeiro.
  if (!user) redirect("/entrar");

  const { apos } = await searchParams;
  const dest = destino(apos);

  // Já verificado: não há o que confirmar.
  if (user.emailVerificado) redirect(dest);

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-md">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-brand-blue sm:text-4xl">
              Confirme seu e-mail
            </h1>
            <p className="mt-4 leading-relaxed text-muted">
              Para proteger a sua conta e a de outras pessoas, a HCE só libera o
              acesso depois de confirmar o e-mail. Enviamos um código para{" "}
              <strong className="text-ink">{user.email}</strong>.
            </p>
          </div>

          <div className="mt-8">
            <VerificarEmail
              email={user.email}
              emailVerified={false}
              autoEnviar
              hrefApos={dest}
            />
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            E-mail errado ou não é você?{" "}
            <SairButton comoLink>Sair</SairButton>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
