"use client";

// Consentimento de cookies (LGPD) — solução própria, 100% de 1ª parte.
// Guardamos a escolha num cookie legível pelo cliente (não httpOnly, pois o
// próprio JS precisa ler para decidir se dispara o analytics e se mostra o
// banner). Ao mudar a escolha, emitimos um evento para os ouvintes reagirem
// na hora (ex.: registrar a página atual assim que a pessoa aceita).

export type Consent = { v: number; analytics: boolean; ts: number };

export const CONSENT_COOKIE = "hce_consent";
export const CONSENT_VERSION = 1; // subir isto força repedir o consentimento
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // ~6 meses
export const CONSENT_EVENT = "hce-consent-change";

export function lerConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const alvo = CONSENT_COOKIE + "=";
  const bruto = document.cookie
    .split("; ")
    .find((c) => c.startsWith(alvo));
  if (!bruto) return null;
  try {
    const obj = JSON.parse(
      decodeURIComponent(bruto.slice(alvo.length)),
    ) as Partial<Consent>;
    if (obj?.v === CONSENT_VERSION && typeof obj.analytics === "boolean") {
      return { v: CONSENT_VERSION, analytics: obj.analytics, ts: obj.ts ?? 0 };
    }
    return null; // versão diferente => pergunta de novo
  } catch {
    return null;
  }
}

export function salvarConsent(analytics: boolean): Consent {
  const c: Consent = { v: CONSENT_VERSION, analytics, ts: Date.now() };
  if (typeof document !== "undefined") {
    const valor = encodeURIComponent(JSON.stringify(c));
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${CONSENT_COOKIE}=${valor}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: c }));
  }
  return c;
}

export function analyticsPermitido(): boolean {
  return lerConsent()?.analytics === true;
}
