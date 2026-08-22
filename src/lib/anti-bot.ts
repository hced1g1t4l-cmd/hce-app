// Helpers compartilhados de anti-bot e captura de IP (RAF_007 / RAF_008).
// Preferencia: Cloudflare Turnstile (igual RQTTE). Fallback: reCAPTCHA v2.

export async function verifyCaptcha(token: string | undefined): Promise<boolean> {
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  const turnstileSite = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
  const recaptchaSite = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (turnstileSecret) {
    if (!token) return false;
    return verifyTurnstile(turnstileSecret, token);
  }
  if (recaptchaSecret) {
    if (!token) return false;
    return verifyRecaptcha(recaptchaSecret, token);
  }

  const siteVisivel = Boolean(turnstileSite || recaptchaSite);
  if (process.env.NODE_ENV === "production" && siteVisivel) {
    console.error(
      "[anti-bot] site key publica sem secret no servidor — bloqueando.",
    );
    return false;
  }
  return true;
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, response: token }),
      },
    );
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

async function verifyRecaptcha(secret: string, token: string): Promise<boolean> {
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
