import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth-user";
import { PAIS_VALIDO, UF_VALIDOS } from "@/lib/localidades";

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

  // Endereco estruturado.
  const estadoRaw = texto(body.estado, 10);
  const estado = estadoRaw && UF_VALIDOS.has(estadoRaw) ? estadoRaw : null;
  const paisRaw = texto(body.pais, 60);
  const pais = paisRaw && PAIS_VALIDO.has(paisRaw) ? paisRaw : null;
  // CEP: guarda so digitos (ate 8).
  const cepDigitos = typeof body.cep === "string" ? body.cep.replace(/\D/g, "").slice(0, 8) : "";
  const cep = cepDigitos.length ? cepDigitos : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: texto(body.bio, 600),
      telefone: texto(body.telefone, 40),
      cep,
      logradouro: texto(body.logradouro, 160),
      numero: texto(body.numero, 20),
      complemento: texto(body.complemento, 80),
      bairro: texto(body.bairro, 80),
      cidade: texto(body.cidade, 80),
      estado,
      pais,
      linkedin,
      instagram,
      facebook,
    },
  });

  return NextResponse.json({ ok: true });
}
