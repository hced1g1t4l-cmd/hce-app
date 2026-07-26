import crypto from "crypto";
import { cookies } from "next/headers";

// Autenticacao simples do painel /adm (RAF_007).
// Usuario/senha unicos. Senha guardada como hash SHA-256 (nao em texto puro).
// Pode ser sobrescrita por variaveis de ambiente na Vercel:
//   ADMIN_USER, ADMIN_PASSWORD (texto puro) ou ADMIN_PASSWORD_HASH (sha256 hex).

export const ADM_COOKIE = "hce_adm";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

const DEFAULT_USER = "hce.d1g1t4l";
// sha256("d1g1t4lhce@26")
const DEFAULT_PASSWORD_HASH =
  "83c1625523a373a0eee89b71668229c0778087494c6118054503bfa624827ac7";

function sessionSecret(): string {
  return process.env.AUTH_SECRET || "hce-dev-secret-troque-em-producao";
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function expectedUser(): string {
  return process.env.ADMIN_USER || DEFAULT_USER;
}

function expectedPasswordHash(): string {
  if (process.env.ADMIN_PASSWORD_HASH) return process.env.ADMIN_PASSWORD_HASH;
  if (process.env.ADMIN_PASSWORD) return sha256(process.env.ADMIN_PASSWORD);
  return DEFAULT_PASSWORD_HASH;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function checkCredentials(user: string, password: string): boolean {
  return (
    safeEqual(user, expectedUser()) &&
    safeEqual(sha256(password), expectedPasswordHash())
  );
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export function createToken(): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `adm.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, exp, sig] = parts;
  const payload = `${scope}.${exp}`;
  if (!safeEqual(sign(payload), sig)) return false;
  if (Number(exp) < Date.now()) return false;
  return scope === "adm";
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADM_COOKIE)?.value);
}

export const ADM_MAX_AGE = MAX_AGE_SECONDS;
