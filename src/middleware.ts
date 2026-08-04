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

const ADM_COOKIE = "hce_adm";

// Paginas /adm que devem ficar acessiveis SEM sessao.
const PUBLICAS = [
  "/adm/login",
  "/adm/esqueci-senha",
  "/adm/redefinir-senha",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const ehPublica = PUBLICAS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (ehPublica) return NextResponse.next();

  const temCookie = Boolean(req.cookies.get(ADM_COOKIE)?.value);
  if (!temCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/adm/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // So paginas do painel. APIs (/api/adm/*) validam no proprio handler.
  matcher: ["/adm", "/adm/:path*"],
};
