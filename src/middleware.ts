import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Defesa em profundidade para o painel /adm.
// Faz uma checagem barata na BORDA: se nao ha cookie de sessao, nem chega a
// renderizar a pagina — redireciona direto para o login. A validacao REAL da
// sessao (token no banco, admin ativo, troca de senha) continua nas paginas
// via requireAdmin(); aqui so cortamos acesso obviamente nao autenticado.
//
// Nao intercepta /api/* (cada rota ja valida no handler) nem as paginas
// publicas do proprio fluxo de acesso.
//
// HTTPS: em producao, HTTP vira 301 para HTTPS e toda resposta leva HSTS
// (2 anos + includeSubDomains + preload) — cadeado verde persistente.

const ADM_COOKIE = "hce_adm";
const HSTS = "max-age=63072000; includeSubDomains; preload";

const PUBLICAS = [
  "/adm/login",
  "/adm/esqueci-senha",
  "/adm/redefinir-senha",
];

function withHsts(res: NextResponse): NextResponse {
  res.headers.set("Strict-Transport-Security", HSTS);
  return res;
}

export function middleware(req: NextRequest) {
  const proto = (
    req.headers.get("x-forwarded-proto") ||
    req.nextUrl.protocol.replace(":", "")
  ).toLowerCase();

  if (process.env.NODE_ENV === "production" && proto === "http") {
    const url = req.nextUrl.clone();
    url.protocol = "https:";
    return withHsts(NextResponse.redirect(url, 301));
  }

  const { pathname } = req.nextUrl;
  const noPainel =
    pathname === "/adm" || pathname.startsWith("/adm/");
  if (noPainel) {
    const ehPublica = PUBLICAS.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );
    if (!ehPublica) {
      const temCookie = Boolean(req.cookies.get(ADM_COOKIE)?.value);
      if (!temCookie) {
        const url = req.nextUrl.clone();
        url.pathname = "/adm/login";
        url.search = "";
        return withHsts(NextResponse.redirect(url));
      }
    }
  }

  return withHsts(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
