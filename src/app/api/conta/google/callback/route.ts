import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { createSession, normalizeEmail } from "@/lib/auth-user";
import { exchangeCode, fetchGoogleProfile } from "@/lib/google-oauth";

// Retorno do Google: valida o state, troca o code por tokens, lê o perfil e
// cria/loga o usuário. Como o Google já confirma o e-mail, marcamos
// emailVerified e a pessoa não precisa do código de 6 dígitos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "hce_goauth";

function safeDest(apos: string | undefined): string {
  return apos && apos.startsWith("/") && !apos.startsWith("//") ? apos : "/conta";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const store = await cookies();
  const raw = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);

  // Usuário cancelou no Google.
  if (url.searchParams.get("error")) {
    return NextResponse.redirect(new URL("/entrar?erro=google_cancelado", url));
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  let salvo: { state: string; apos: string } | null = null;
  try {
    salvo = raw ? (JSON.parse(raw) as { state: string; apos: string }) : null;
  } catch {
    salvo = null;
  }

  if (!code || !state || !salvo || salvo.state !== state) {
    return NextResponse.redirect(new URL("/entrar?erro=google_falhou", url));
  }

  try {
    const tokens = await exchangeCode(code);
    const perfil = await fetchGoogleProfile(tokens.access_token);

    if (!perfil.email || perfil.email_verified === false) {
      return NextResponse.redirect(new URL("/entrar?erro=google_email", url));
    }

    const email = normalizeEmail(perfil.email);

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: perfil.name || email.split("@")[0],
          email,
          emailVerified: new Date(), // Google já confirmou o e-mail
          role: "MEMBER",
          plano: "free",
          aceitaComunicacoes: false,
        },
      });
    } else if (!user.emailVerified) {
      // Conta antiga (por senha) que ainda não tinha confirmado: o Google
      // confirma o e-mail agora.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    // Vincula/atualiza a conta Google (idempotente pela chave provider+id).
    const expiresAt = tokens.expires_in
      ? Math.floor(Date.now() / 1000) + tokens.expires_in
      : null;
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: perfil.sub,
        },
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "google",
        providerAccountId: perfil.sub,
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        token_type: tokens.token_type,
        scope: tokens.scope,
        expires_at: expiresAt,
      },
      update: {
        userId: user.id,
        access_token: tokens.access_token,
        id_token: tokens.id_token,
        expires_at: expiresAt,
      },
    });

    await createSession(user.id);
    return NextResponse.redirect(new URL(safeDest(salvo.apos), url));
  } catch {
    return NextResponse.redirect(new URL("/entrar?erro=google_falhou", url));
  }
}
