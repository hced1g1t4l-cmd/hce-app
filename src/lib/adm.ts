import crypto from "crypto";
import { cookies } from "next/headers";

// Autenticacao simples do painel /adm (RAF_007).
// Usuario/senha unicos, definidos por variaveis de ambiente na Vercel:
//   AUTH_SECRET       -> assina o cookie de sessao (OBRIGATORIO em producao)
//   ADMIN_USER        -> usuario do painel
//   ADMIN_PASSWORD    -> senha em texto puro (comparada de forma segura)
//   ADMIN_PASSWORD_HASH -> alternativa: hash sha256 da senha (hex)
//
// Em producao, se AUTH_SECRET ou a senha nao estiverem configurados, o painel
// fica "fail-closed" (ninguem entra) em vez de usar um segredo fixo e forjavel.

export const ADM_COOKIE = "hce_adm";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas

const IS_PROD = process.env.NODE_ENV === "production";

// Fallbacks usados SOMENTE em desenvolvimento local.
const DEV_USER = "hce.d1g1t4l";
const DEV_PASSWORD = "d1g1t4lhce@26";
const DEV_SECRET = "hce-dev-secret-apenas-local";

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

// Retorna o segredo de sessao, ou null se ausente em producao (fail-closed).
function sessionSecret(): string | null {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  return IS_PROD ? null : DEV_SECRET;
}

function expectedUser(): string {
  if (process.env.ADMIN_USER) return process.env.ADMIN_USER;
  return IS_PROD ? "" : DEV_USER;
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function passwordOk(input: string): boolean {
  const plain = process.env.ADMIN_PASSWORD;
  if (plain) return safeEqual(input, plain);

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) return safeEqual(sha256(input), hash);

  // Sem senha configurada: so aceita o fallback em desenvolvimento.
  return IS_PROD ? false : safeEqual(input, DEV_PASSWORD);
}

export function checkCredentials(user: string, password: string): boolean {
  const expUser = expectedUser();
  // Fail-closed: sem usuario/segredo configurado em producao, ninguem entra.
  if (!expUser || sessionSecret() === null) return false;
  return safeEqual(user, expUser) && passwordOk(password);
}

function sign(payload: string): string | null {
  const secret = sessionSecret();
  if (secret === null) return null;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function createToken(): string | null {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `adm.${exp}`;
  const sig = sign(payload);
  if (sig === null) return null;
  return `${payload}.${sig}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [scope, exp, sig] = parts;
  const payload = `${scope}.${exp}`;
  const expected = sign(payload);
  if (expected === null) return false;
  if (!safeEqual(expected, sig)) return false;
  if (Number(exp) < Date.now()) return false;
  return scope === "adm";
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADM_COOKIE)?.value);
}

export const ADM_MAX_AGE = MAX_AGE_SECONDS;
