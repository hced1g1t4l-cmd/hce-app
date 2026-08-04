import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  randomToken,
  sha256,
} from "@/lib/auth-user";

// Autenticacao do painel /adm — agora com CONTAS no banco (modelo Admin).
// Substitui o antigo login unico por variavel de ambiente (corte total).
//
// - Senha: scrypt (mesmo esquema dos usuarios do site).
// - Sessao: token aleatorio na tabela AdminSession + cookie httpOnly (revogavel).
// - Auditoria: helper logAdm() registra acoes em AdminLog.

export const ADM_COOKIE = "hce_adm";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 horas
export const ADM_MAX_AGE = MAX_AGE_SECONDS;
const IS_PROD = process.env.NODE_ENV === "production";

export type AdminSessao = {
  id: string;
  login: string;
  nome: string;
  fotoUrl: string | null;
  emailPrincipal: string | null;
  emailSecundario: string | null;
  precisaTrocarSenha: boolean;
};

// Reexporta utilitarios de senha para uso nas rotas do painel.
export { hashPassword, verifyPassword };

// Regras de senha forte (iguais as do cadastro do site).
export function senhaForte(s: string): boolean {
  return (
    s.length >= 6 &&
    /[A-Z]/.test(s) &&
    /[a-z]/.test(s) &&
    /[0-9]/.test(s) &&
    /[^A-Za-z0-9]/.test(s)
  );
}

// Cria a sessao no banco e grava o cookie. So em Route Handler / Server Action.
export async function createAdminSession(adminId: string): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + MAX_AGE_SECONDS * 1000);
  await prisma.adminSession.create({
    data: { sessionToken: token, adminId, expires },
  });
  const store = await cookies();
  store.set(ADM_COOKIE, token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

// Le a sessao do admin logado (ou null). Atualiza ultimoAcesso com throttle.
export async function getAdmin(): Promise<AdminSessao | null> {
  const store = await cookies();
  const token = store.get(ADM_COOKIE)?.value;
  if (!token) return null;

  const sess = await prisma.adminSession.findUnique({
    where: { sessionToken: token },
    include: { admin: true },
  });
  if (!sess || sess.expires < new Date()) return null;
  const a = sess.admin;
  if (!a || !a.ativo) return null;

  const agora = Date.now();
  const ultimo = a.ultimoAcesso ? a.ultimoAcesso.getTime() : 0;
  if (agora - ultimo > 10 * 60 * 1000) {
    await prisma.admin
      .update({ where: { id: a.id }, data: { ultimoAcesso: new Date() } })
      .catch(() => null);
  }

  return {
    id: a.id,
    login: a.login,
    nome: a.nome,
    fotoUrl: a.fotoUrl,
    emailPrincipal: a.emailPrincipal,
    emailSecundario: a.emailSecundario,
    precisaTrocarSenha: a.precisaTrocarSenha,
  };
}

// Compat: paginas antigas usam if (!(await isAuthed())) redirect("/adm/login").
export async function isAuthed(): Promise<boolean> {
  return (await getAdmin()) !== null;
}

// Uso nas paginas do painel: garante login e troca de senha no 1o acesso.
// Passe { pulaTrocaSenha: true } na propria pagina de troca de senha.
export async function requireAdmin(opts?: {
  pulaTrocaSenha?: boolean;
}): Promise<AdminSessao> {
  const admin = await getAdmin();
  if (!admin) redirect("/adm/login");
  if (admin.precisaTrocarSenha && !opts?.pulaTrocaSenha) {
    redirect("/adm/trocar-senha");
  }
  return admin;
}

// Encerra a sessao atual (logout).
export async function destroyAdminSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(ADM_COOKIE)?.value;
  if (token) {
    await prisma.adminSession
      .delete({ where: { sessionToken: token } })
      .catch(() => null);
    store.delete(ADM_COOKIE);
  }
  return token ?? null;
}

// Encerra TODAS as sessoes de um admin (ex.: apos trocar/redefinir senha).
export async function destroyAllAdminSessions(adminId: string): Promise<void> {
  await prisma.adminSession
    .deleteMany({ where: { adminId } })
    .catch(() => null);
}

// Valida credenciais no login. Retorna o admin (ou null).
export async function authenticateAdmin(login: string, senha: string) {
  const l = login.trim().toLowerCase();
  if (!l || !senha) return null;
  const a = await prisma.admin.findUnique({ where: { login: l } });
  if (!a || !a.ativo) return null;
  if (!verifyPassword(senha, a.senhaHash)) return null;
  return a;
}

// Bloqueio de conta por forca-bruta (persistente no banco, resistente a
// reinicios de instancia serverless — ao contrario do rate-limit em memoria).
export const LOGIN_MAX_FALHAS = 8;
export const LOGIN_BLOQUEIO_MIN = 15;

export type ResultadoLogin =
  | { status: "ok"; admin: Awaited<ReturnType<typeof authenticateAdmin>> }
  | { status: "invalido" }
  | { status: "bloqueado"; ate: Date };

// Autentica considerando o bloqueio por tentativas. Nunca revela se o login
// existe: credenciais erradas e login inexistente retornam "invalido".
export async function autenticarAdminComBloqueio(
  login: string,
  senha: string,
): Promise<ResultadoLogin> {
  const l = login.trim().toLowerCase();
  if (!l || !senha) return { status: "invalido" };

  const a = await prisma.admin.findUnique({ where: { login: l } });
  if (!a || !a.ativo) return { status: "invalido" };

  if (a.bloqueadoAte && a.bloqueadoAte > new Date()) {
    return { status: "bloqueado", ate: a.bloqueadoAte };
  }

  if (!verifyPassword(senha, a.senhaHash)) {
    const falhas = a.tentativasFalhas + 1;
    const bloquear = falhas >= LOGIN_MAX_FALHAS;
    await prisma.admin
      .update({
        where: { id: a.id },
        data: {
          tentativasFalhas: bloquear ? 0 : falhas,
          bloqueadoAte: bloquear
            ? new Date(Date.now() + LOGIN_BLOQUEIO_MIN * 60 * 1000)
            : a.bloqueadoAte,
        },
      })
      .catch(() => null);
    return { status: "invalido" };
  }

  // Sucesso: zera o contador e libera bloqueio residual.
  if (a.tentativasFalhas !== 0 || a.bloqueadoAte) {
    await prisma.admin
      .update({
        where: { id: a.id },
        data: { tentativasFalhas: 0, bloqueadoAte: null },
      })
      .catch(() => null);
  }
  return { status: "ok", admin: a };
}

// ————— Auditoria —————

type LogArgs = {
  adminId?: string | null;
  adminLogin: string;
  acao: string;
  detalhe?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export async function logAdm(args: LogArgs): Promise<void> {
  await prisma.adminLog
    .create({
      data: {
        adminId: args.adminId ?? null,
        adminLogin: args.adminLogin,
        acao: args.acao,
        detalhe: args.detalhe ?? null,
        ip: args.ip ?? null,
        userAgent: args.userAgent ?? null,
      },
    })
    .catch(() => null);
}

// Le ip/user-agent do request atual (para logs em Server Actions/paginas).
export async function contextoRequisicao(): Promise<{
  ip: string | null;
  userAgent: string | null;
}> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    null;
  return { ip, userAgent: h.get("user-agent") };
}

// Hash de token de reset (guardamos so o hash no banco).
export function hashResetToken(token: string): string {
  return sha256(token);
}
