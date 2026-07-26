import { NextResponse } from "next/server";
import { ADM_COOKIE } from "@/lib/adm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/adm/login", req.url), {
    status: 303,
  });
  res.cookies.set(ADM_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
