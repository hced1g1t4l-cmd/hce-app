import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { RedefinirSenhaForm } from "@/components/site/redefinir-senha-form";
import { prisma } from "@/lib/db";
import { sha256 } from "@/lib/auth-user";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Criar nova senha · HCE",
  robots: { index: false, follow: false },
};

async function tokenValido(token?: string): Promise<boolean> {
  if (!token) return false;
  const vt = await prisma.verificationToken.findFirst({
    where: { token: sha256(token) },
  });
  return Boolean(vt && vt.expires > new Date());
}

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const valido = await tokenValido(token);

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-md">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-brand-blue sm:text-4xl">
              Criar nova senha
            </h1>
          </div>

          {valido && token ? (
            <RedefinirSenhaForm token={token} />
          ) : (
            <div className="mt-8 rounded-3xl border border-line bg-white p-6 text-center shadow-sm sm:p-8">
              <p className="leading-relaxed text-muted">
                Este link é inválido ou expirou. Peça um novo link de
                redefinição.
              </p>
              <Link
                href="/esqueci-senha"
                className="mt-6 inline-block font-semibold text-brand-blue hover:underline"
              >
                Pedir novo link
              </Link>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
