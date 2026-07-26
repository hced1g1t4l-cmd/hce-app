import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

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

async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  // Sem chave configurada: pula verificacao (usa apenas honeypot).
  if (!secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}

export async function POST(req: Request) {
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
        telefone: data.telefone,
        canalEmail: data.canalEmail,
        canalSms: data.canalSms,
        canalWhatsapp: data.canalWhatsapp,
        aceitaPromos: data.aceitaPromos,
        ip: getClientIp(req),
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
