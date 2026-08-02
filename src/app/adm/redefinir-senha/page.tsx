import { prisma } from "@/lib/db";
import { hashResetToken } from "@/lib/adm";
import { RedefinirSenhaForm } from "@/components/adm/redefinir-senha-form";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdmRedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let valido = false;
  if (token) {
    const registro = await prisma.adminResetToken.findUnique({
      where: { tokenHash: hashResetToken(token) },
    });
    valido = Boolean(
      registro && !registro.usado && registro.expires >= new Date(),
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blue-deep p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-brand-blue">
          Nova senha
        </h1>

        {valido && token ? (
          <>
            <p className="mt-1 text-sm text-muted">
              Crie uma nova senha para o seu acesso ao painel.
            </p>
            <RedefinirSenhaForm token={token} />
          </>
        ) : (
          <>
            <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Este link é inválido, já foi usado ou expirou. Solicite um novo.
            </p>
            <div className="mt-6 text-center">
              <a
                href="/adm/esqueci-senha"
                className="text-sm font-semibold text-brand-blue hover:underline"
              >
                Pedir novo link
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
