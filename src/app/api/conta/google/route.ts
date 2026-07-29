import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, googleConfigured } from "@/lib/google-oauth";

// Início do login com Google: gera um "state" anti-CSRF, guarda num cookie
// curto (com o destino pós-login) e redireciona para o consentimento do Google.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATE_COOKIE = "hce_goauth";

function destinoSeguro(apos: string | null): string {
  return apos && apos.startsWith("/") && !apos.startsWith("//") ? apos : "/conta";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (!googleConfigured()) {
    return NextResponse.redirect(
      new URL("/entrar?erro=google_indisponivel", url),
    );
  }

  const apos = destinoSeguro(url.searchParams.get("apos"));
  const state = crypto.randomBytes(16).toString("hex");

  const store = await cookies();
  store.set(STATE_COOKIE, JSON.stringify({ state, apos }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 min para concluir o login
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
