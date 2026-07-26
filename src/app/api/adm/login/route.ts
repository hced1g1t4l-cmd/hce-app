import { NextResponse } from "next/server";
import { checkCredentials, createToken, ADM_COOKIE, ADM_MAX_AGE } from "@/lib/adm";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ate 5 tentativas de login a cada 10 minutos por IP.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "sem-ip";
  const limit = rateLimit(`adm-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.redirect(new URL("/adm/login?erro=rate", req.url), {
      status: 303,
    });
  }

  const form = await req.formData();
  const usuario = String(form.get("usuario") || "");
  const senha = String(form.get("senha") || "");

  if (!checkCredentials(usuario, senha)) {
    return NextResponse.redirect(new URL("/adm/login?erro=1", req.url), {
      status: 303,
    });
  }

  const token = createToken();
  // Sem AUTH_SECRET configurado em producao: nao emite sessao (fail-closed).
  if (!token) {
    return NextResponse.redirect(new URL("/adm/login?erro=config", req.url), {
      status: 303,
    });
  }

  const res = NextResponse.redirect(new URL("/adm", req.url), { status: 303 });
  res.cookies.set(ADM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADM_MAX_AGE,
  });
  return res;
}
