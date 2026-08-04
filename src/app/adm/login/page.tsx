import Script from "next/script";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default async function AdmLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  if (await isAuthed()) redirect("/adm");
  const { erro } = await searchParams;

  const mensagemErro =
    erro === "rate"
      ? "Muitas tentativas. Aguarde alguns minutos e tente novamente."
      : erro === "bloqueado"
      ? "Conta temporariamente bloqueada por tentativas de acesso. Aguarde alguns minutos ou redefina a sua senha."
      : erro === "config"
        ? "Painel indisponível: configuração de acesso pendente."
        : erro === "sessao"
          ? "Sua sessão expirou. Entre novamente."
          : erro === "captcha"
            ? "Confirme que você não é um robô e tente novamente."
            : erro
              ? "Usuário ou senha inválidos."
              : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-blue-deep p-6">
      <form
        action="/api/adm/login"
        method="post"
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
      >
        <h1 className="font-display text-2xl font-bold text-brand-blue">
          Painel HCE
        </h1>
        <p className="mt-1 text-sm text-muted">Acesso restrito.</p>

        {mensagemErro && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {mensagemErro}
          </p>
        )}

        <label className="mt-6 block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Usuário
          </span>
          <input
            name="usuario"
            type="text"
            required
            autoComplete="username"
            className="hce-input mt-1.5"
          />
        </label>

        <label className="mt-4 block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Senha
          </span>
          <input
            name="senha"
            type="password"
            required
            autoComplete="current-password"
            className="hce-input mt-1.5"
          />
        </label>

        {SITE_KEY && (
          <>
            <Script src="https://www.google.com/recaptcha/api.js" async defer />
            <div className="mt-6 flex justify-center">
              <div className="g-recaptcha" data-sitekey={SITE_KEY} />
            </div>
          </>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-brand-blue px-6 py-3 font-display text-sm font-semibold text-brand-amber transition-all duration-300 hover:bg-brand-blue-dark"
        >
          Entrar
        </button>

        <div className="mt-4 text-center">
          <a
            href="/adm/esqueci-senha"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            Esqueci minha senha
          </a>
        </div>
      </form>
    </main>
  );
}
