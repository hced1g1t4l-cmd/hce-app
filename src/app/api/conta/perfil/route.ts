import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";

// Atualiza o perfil editavel da pessoa (bio, telefone, endereco, redes sociais).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Normaliza um link social: aceita vazio, exige http(s), corta tamanho.
// Retorna undefined se invalido (para nao gravar lixo/esquemas perigosos).
function linkSocial(valor: unknown): string | null | undefined {
  if (typeof valor !== "string") return null;
  const v = valor.trim();
  if (!v) return null;
  let url = v;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (url.length > 300) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

function texto(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const v = valor.trim();
  if (!v) return null;
  return v.slice(0, max);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Envio inválido" }, { status: 400 });
  }

  const linkedin = linkSocial(body.linkedin);
  const instagram = linkSocial(body.instagram);
  const facebook = linkSocial(body.facebook);
  if (linkedin === undefined || instagram === undefined || facebook === undefined) {
    return NextResponse.json(
      { error: "Verifique os links das redes sociais." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: texto(body.bio, 600),
      telefone: texto(body.telefone, 40),
      endereco: texto(body.endereco, 200),
      linkedin,
      instagram,
      facebook,
    },
  });

  return NextResponse.json({ ok: true });
}
