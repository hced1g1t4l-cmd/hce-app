// Envio de e-mail transacional via API do Brevo (HTTP, sem dependencia extra).
// Requer BREVO_API_KEY na Vercel. Sem a chave, nao envia (mas nao quebra o fluxo).
// O remetente (EMAIL_FROM) precisa ser um sender verificado no Brevo.

type SendArgs = { to: string; subject: string; html: string };

export async function sendEmail({
  to,
  subject,
  html,
}: SendArgs): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM || "contato@hcegastronomia.com";
  const fromName = process.env.EMAIL_FROM_NAME || "HCE";

  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email] BREVO_API_KEY ausente — e-mail NÃO enviado. Assunto: "${subject}" para ${to}`,
      );
    }
    return false;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: from },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// URL base do site (para montar links em e-mails).
export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.hcegastronomia.com"
  );
}
