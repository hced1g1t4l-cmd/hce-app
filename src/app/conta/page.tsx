import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Button } from "@/components/ui/button";
import { SairButton } from "@/components/site/sair-button";
import { PerfilForm } from "@/components/site/perfil-form";
import { AvatarEditor } from "@/components/site/avatar-editor";
import { getSessionUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Minha conta · HCE",
  robots: { index: false, follow: false },
};

const PLANO_LABEL: Record<string, string> = {
  free: "Gratuito",
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar?redirect=/conta");

  const perfil = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      image: true,
      bio: true,
      telefone: true,
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      pais: true,
      linkedin: true,
      instagram: true,
      facebook: true,
    },
  });

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-16 sm:py-20">
        <Container className="max-w-2xl">
          <div className="flex items-center gap-4 sm:gap-5">
            <AvatarEditor initialImage={perfil?.image ?? null} nome={user.nome} />
            <div>
              <h1 className="font-display text-3xl font-bold text-brand-blue sm:text-4xl">
                Olá, {user.nome?.split(" ")[0] ?? "bem-vindo"}!
              </h1>
              <p className="mt-2 text-lg leading-relaxed text-muted">
                Esta é a sua área na HCE.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
              Seus dados
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">
                  Nome
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {user.nome ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">
                  E-mail
                </dt>
                <dd className="mt-1 font-medium break-all text-ink">
                  {user.email ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs tracking-wide text-muted uppercase">
                  Plano
                </dt>
                <dd className="mt-1">
                  <span className="rounded-full bg-brand-amber/25 px-3 py-1 text-sm font-semibold text-brand-amber-dark">
                    {PLANO_LABEL[user.plano] ?? "Gratuito"}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <PerfilForm
            init={{
              bio: perfil?.bio ?? "",
              telefone: perfil?.telefone ?? "",
              logradouro: perfil?.logradouro ?? "",
              numero: perfil?.numero ?? "",
              complemento: perfil?.complemento ?? "",
              bairro: perfil?.bairro ?? "",
              cidade: perfil?.cidade ?? "",
              estado: perfil?.estado ?? "",
              pais: perfil?.pais ?? "",
              linkedin: perfil?.linkedin ?? "",
              instagram: perfil?.instagram ?? "",
              facebook: perfil?.facebook ?? "",
            }}
          />

          <div className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
              Atalhos
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href="/feed" size="md">
                Ler o Feed HCE
              </Button>
              <Button href="/clube" size="md" variant="blue">
                Conhecer o +HCE
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <SairButton />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
