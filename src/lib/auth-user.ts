import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

// Autenticacao de usuario do site (Frente A): e-mail + senha, sessao em banco.
// Diferente do login do painel /adm (lib/adm.ts), que e separado.
//
// - Senha: hash scrypt com salt aleatorio, no formato "scrypt$<salt hex>$<hash hex>".
// - Sessao: token aleatorio guardado na tabela Session (Prisma) + cookie httpOnly.
//   Guardar em banco permite revogar (logout, "sair de todos os aparelhos").

const SESS_COOKIE = "hce_sess";
const SESSION_DAYS = 30;
const IS_PROD = process.env.NODE_ENV === "production";

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const dk = crypto.scryptSync(password, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${dk.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  let dk: Buffer;
  try {
    dk = crypto.scryptSync(password, salt, expected.length);
  } catch {
    return false;
  }
  if (dk.length !== expected.length) return false;
  return crypto.timingSafeEqual(dk, expected);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Cria a sessao no banco e grava o cookie. So chamar em Route Handler / Server Action.
export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 86400000);
  await prisma.session.create({
    data: { sessionToken: token, userId, expires },
  });
  const store = await cookies();
  store.set(SESS_COOKIE, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export type SessionUser = {
  id: string;
  nome: string | null;
  email: string | null;
  role: "MEMBER" | "ADMIN";
  plano: string;
};

// Le a sessao a partir do cookie. Pode ser usado em Server Components (so leitura).
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESS_COOKIE)?.value;
  if (!token) return null;

  const sess = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  if (!sess || sess.expires < new Date()) return null;

  const u = sess.user;
  return {
    id: u.id,
    nome: u.name,
    email: u.email,
    role: u.role,
    plano: u.plano,
  };
}

// Remove a sessao do banco e limpa o cookie. So em Route Handler / Server Action.
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESS_COOKIE)?.value;
  if (token) {
    await prisma.session
      .delete({ where: { sessionToken: token } })
      .catch(() => null);
    store.delete(SESS_COOKIE);
  }
}
