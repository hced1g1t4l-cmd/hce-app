import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-user";

// Estado da sessao para o cabecalho do site (Entrar / Minha conta).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json(
    { user: user ? { nome: user.nome, email: user.email } : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
