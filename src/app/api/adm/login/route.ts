import { NextResponse } from "next/server";
import { checkCredentials, createToken, ADM_COOKIE, ADM_MAX_AGE } from "@/lib/adm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData();
  const usuario = String(form.get("usuario") || "");
  const senha = String(form.get("senha") || "");

  if (!checkCredentials(usuario, senha)) {
    return NextResponse.redirect(new URL("/adm/login?erro=1", req.url), {
      status: 303,
    });
  }

  const res = NextResponse.redirect(new URL("/adm", req.url), { status: 303 });
  res.cookies.set(ADM_COOKIE, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADM_MAX_AGE,
  });
  return res;
}
