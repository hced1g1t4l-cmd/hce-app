import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  createAdminSession,
  logAdm,
} from "@/lib/adm";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/anti-bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ate 5 tentativas de login a cada 10 minutos por IP.
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const ip = getClientIp(req) ?? "sem-ip";
  const userAgent = req.headers.get("user-agent");
  const limit = rateLimit(`adm-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.redirect(new URL("/adm/login?erro=rate", req.url), {
      status: 303,
    });
  }

  const form = await req.formData();
  const usuario = String(form.get("usuario") || "").trim().toLowerCase();
  const senha = String(form.get("senha") || "");

  const admin = await authenticateAdmin(usuario, senha);
  if (!admin) {
    await logAdm({
      adminLogin: usuario || "(vazio)",
      acao: "login.falha",
      detalhe: "Usuário ou senha inválidos",
      ip,
      userAgent,
    });
    return NextResponse.redirect(new URL("/adm/login?erro=1", req.url), {
      status: 303,
    });
  }

  await createAdminSession(admin.id);
  await prisma.admin
    .update({ where: { id: admin.id }, data: { ultimoAcesso: new Date() } })
    .catch(() => null);
  await logAdm({
    adminId: admin.id,
    adminLogin: admin.login,
    acao: "login",
    ip,
    userAgent,
  });

  // Primeiro acesso (ou reset): forca a troca de senha antes de usar o painel.
  const destino = admin.precisaTrocarSenha ? "/adm/trocar-senha" : "/adm";
  return NextResponse.redirect(new URL(destino, req.url), { status: 303 });
}
