import { NextResponse } from "next/server";
import { ADM_COOKIE, getAdmin, logAdm } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getAdmin();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADM_COOKIE}=`))
    ?.split("=")[1];

  if (token) {
    await prisma.adminSession
      .delete({ where: { sessionToken: token } })
      .catch(() => null);
  }
  if (admin) {
    await logAdm({
      adminId: admin.id,
      adminLogin: admin.login,
      acao: "logout",
      ip: getClientIp(req),
      userAgent: req.headers.get("user-agent"),
    });
  }

  const res = NextResponse.redirect(new URL("/adm/login", req.url), {
    status: 303,
  });
  res.cookies.set(ADM_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
