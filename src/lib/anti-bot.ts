// Helpers compartilhados de anti-bot e captura de IP (RAF_007 / RAF_008).

export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!secret) {
    // Fail-closed: em producao, se o widget esta configurado (site key
    // presente) mas falta o segredo no servidor, tratamos como ma
    // configuracao e NAO deixamos passar (evita burlar o captcha).
    if (process.env.NODE_ENV === "production" && siteKey) {
      console.error(
        "[anti-bot] RECAPTCHA_SECRET_KEY ausente em producao com site key configurada — bloqueando envio.",
      );
      return false;
    }
    // Dev ou captcha totalmente desativado: usa apenas honeypot.
    return true;
  }
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

export function getClientIp(req: Request): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip");
}
