import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/db";

// Registra um pageview publico para o painel de analytics (RAF_013).
// Geo (cidade/lat/lng) vem dos headers de geo-IP da Vercel; visitante unico
// vem de um cookie de 1a parte (hce_vid). Nao coleta dado pessoal.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VID_COOKIE = "hce_vid";
const VID_MAX_AGE = 60 * 60 * 24 * 365; // 1 ano

function decode(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  // Ignora bots/crawlers simples.
  if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview/i.test(ua)) {
    return new NextResponse(null, { status: 204 });
  }

  let path = "/";
  try {
    const body = (await req.json()) as { path?: unknown };
    if (typeof body?.path === "string" && body.path) {
      path = body.path.slice(0, 200);
    }
  } catch {
    // corpo invalido: ignora silenciosamente
  }

  // Nunca rastreia area interna nem endpoints.
  if (path.startsWith("/adm") || path.startsWith("/api")) {
    return new NextResponse(null, { status: 204 });
  }

  const store = await cookies();
  let vid = store.get(VID_COOKIE)?.value;
  const isNew = !vid;
  if (!vid) vid = crypto.randomUUID();

  const h = req.headers;
  const lat = h.get("x-vercel-ip-latitude");
  const lng = h.get("x-vercel-ip-longitude");

  try {
    await prisma.pageView.create({
      data: {
        path,
        visitorId: vid,
        city: decode(h.get("x-vercel-ip-city")),
        country: h.get("x-vercel-ip-country"),
        region: h.get("x-vercel-ip-country-region"),
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
      },
    });
  } catch {
    // falha ao gravar nao deve quebrar a navegacao
  }

  const res = new NextResponse(null, { status: 204 });
  if (isNew) {
    res.cookies.set(VID_COOKIE, vid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VID_MAX_AGE,
    });
  }
  return res;
}
