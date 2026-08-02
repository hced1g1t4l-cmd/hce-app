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
  telefone: z.string().trim().min(8, "Telefone invalido").max(30),
  canalEmail: z.boolean().default(false),
  canalSms: z.boolean().default(false),
  canalWhatsapp: z.boolean().default(false),
  aceitaPromos: z.boolean().default(false),
  captchaToken: z.string().optional(),
  // Honeypot: bots costumam preencher. Deve vir vazio.
  website: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = rateLimit(`leads:${ip ?? "sem-ip"}`, 10, 60 * 60 * 1000);
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

  // Honeypot preenchido => provavelmente bot. Fingimos sucesso.
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
    await prisma.clubeLead.create({
      data: {
        nome: data.nome,
        email: data.email,
        telefone: normalizarTelefone(data.telefone) ?? data.telefone,
        canalEmail: data.canalEmail,
        canalSms: data.canalSms,
        canalWhatsapp: data.canalWhatsapp,
        aceitaPromos: data.aceitaPromos,
        ip,
        userAgent: req.headers.get("user-agent"),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel salvar. Tente novamente." },
      { status: 500 },
    );
  }
}
