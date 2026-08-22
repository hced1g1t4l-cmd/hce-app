import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyCaptcha, getClientIp } from "@/lib/anti-bot";
import { rateLimit } from "@/lib/rate-limit";
import { normalizarTelefone } from "@/lib/telefone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  email: z.string().trim().email("E-mail invalido").max(160),
  telefone: z.string().trim().max(30).optional().or(z.literal("")),
  mensagem: z.string().trim().min(5, "Escreva sua mensagem").max(3000),
  permiteEmail: z.boolean().default(false),
  permiteTelefone: z.boolean().default(false),
  permiteWhatsapp: z.boolean().default(false),
  captchaToken: z.string().optional(),
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await rateLimit(`contato:${ip ?? "sem-ip"}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados invalidos" },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (data.website && data.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const humano = await verifyCaptcha(data.captchaToken);
  if (!humano) {
    return NextResponse.json(
      { error: "Falha na verificacao anti-robo. Tente novamente." },
      { status: 400 },
    );
  }

  try {
    await prisma.contatoMensagem.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: normalizarTelefone(data.telefone),
        mensagem: data.mensagem,
        permiteEmail: data.permiteEmail,
        permiteTelefone: data.permiteTelefone,
        permiteWhatsapp: data.permiteWhatsapp,
        ip,
        userAgent: req.headers.get("user-agent"),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel enviar. Tente novamente." },
      { status: 500 },
    );
  }
}
