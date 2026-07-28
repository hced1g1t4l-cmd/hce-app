import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getSessionUser, randomOtp, sha256 } from "@/lib/auth-user";
import { emailConfigured, sendEmail } from "@/lib/email";

// Verificacao de e-mail (opcional). Passo 1: gera um codigo de 6 digitos, guarda
// so o hash com validade de 100s e envia por e-mail. Exige sessao (a pessoa ja
// passou pelo reCAPTCHA ao criar a conta), entao aqui basta limitar reenvios.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTL_SEC = 100;
const IDENT = (userId: string) => `emailverify:${userId}`;

function emailHtml(codigo: string): string {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#131720">
    <h2 style="color:#003288">Confirme seu e-mail</h2>
    <p>Use o código abaixo para confirmar o seu e-mail na HCE. Ele vale por <strong>${TTL_SEC} segundos</strong>.</p>
    <p style="margin:26px 0;text-align:center">
      <span style="display:inline-block;background:#f4f6fb;border:1px solid #e5e9f2;color:#003288;font-size:30px;font-weight:bold;letter-spacing:8px;padding:14px 24px;border-radius:14px">${codigo}</span>
    </p>
    <p style="font-size:13px;color:#5a6473">Se você não pediu isso, pode ignorar este e-mail.</p>
    <p style="font-size:12px;color:#8a93a3;border-top:1px solid #e5e9f2;margin-top:18px;padding-top:12px">Este é um e-mail automático enviado de um endereço que não recebe respostas. Por favor, não responda.</p>
  </div>`;
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login para continuar." }, { status: 401 });
  }

  // Ja verificado: nao envia nada, so avisa.
  const atual = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerified: true, email: true },
  });
  if (atual?.emailVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }
  if (!atual?.email) {
    return NextResponse.json(
      { error: "Sua conta não tem um e-mail para verificar." },
      { status: 400 },
    );
  }

  // Sem provedor de e-mail configurado não adianta gerar código.
  if (!emailConfigured()) {
    return NextResponse.json(
      {
        error:
          "O envio de e-mail ainda não está ativo no servidor. Avise a equipe da HCE (falta configurar o remetente).",
      },
      { status: 503 },
    );
  }

  // Anti-flood: no maximo 3 envios a cada 15 min por usuario.
  const rl = rateLimit(`verif-enviar:${user.id}`, 3, 15 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Você pediu muitos códigos. Aguarde alguns minutos e tente de novo." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const codigo = randomOtp();
  const expires = new Date(Date.now() + TTL_SEC * 1000);
  const identifier = IDENT(user.id);

  // Um codigo ativo por vez: apaga o anterior e cria o novo.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token: sha256(codigo), expires },
  });

  const enviado = await sendEmail({
    to: atual.email,
    subject: "Seu código de confirmação · HCE",
    html: emailHtml(codigo),
  });

  if (!enviado) {
    return NextResponse.json(
      { error: "Não conseguimos enviar o e-mail agora. Tente novamente em instantes." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, expiresInSec: TTL_SEC });
}
