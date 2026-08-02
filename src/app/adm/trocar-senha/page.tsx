import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/adm";
import { TrocarSenhaForm } from "@/components/adm/trocar-senha-form";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function TrocarSenhaPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/adm/login");
  // Se ja trocou, nao precisa ficar preso aqui.
  if (!admin.precisaTrocarSenha) redirect("/adm");

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blue-deep p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-brand-blue">
          Defina sua senha
        </h1>
        <p className="mt-1 text-sm text-muted">
          Olá, <strong>{admin.nome}</strong>. Este é seu primeiro acesso —
          crie uma senha pessoal para continuar.
        </p>

        <div className="mt-6">
          <TrocarSenhaForm exigeAtual={false} redirecionarPara="/adm/conta" />
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Depois de definir a senha, você poderá cadastrar seus e-mails de
          resgate em <strong>Minha conta</strong>.
        </p>
      </div>
    </main>
  );
}
