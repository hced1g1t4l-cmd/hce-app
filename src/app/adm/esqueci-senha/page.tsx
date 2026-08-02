import { EsqueciSenhaForm } from "@/components/adm/esqueci-senha-form";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default function AdmEsqueciSenhaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blue-deep p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-brand-blue">
          Recuperar acesso
        </h1>
        <p className="mt-1 text-sm text-muted">
          Informe seu login ou um e-mail de resgate cadastrado. Enviaremos um
          link para você definir uma nova senha.
        </p>
        <EsqueciSenhaForm />
      </div>
    </main>
  );
}
