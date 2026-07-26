// Configuracoes centrais do site HCE (links, contatos, redes).

// WhatsApp de acao (FAB_006). ATENCAO: numero provisorio ate a HCE confirmar.
// Formato E.164 sem "+", so digitos: 55 (Brasil) + DDD + numero.
export const WHATSAPP_NUMBER = "5521999999999";

const WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da HCE e gostaria de saber mais.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export const EMAIL_CONTATO = "contato@hcegastronomia.com";

// Redes sociais oficiais (fonte: "REDES SOCIAIS HCE GASTRONOMIA.pdf").
export const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/hcegastronomia/" },
  { label: "TikTok", href: "https://www.tiktok.com/@hce.gastronomia" },
  { label: "YouTube", href: "https://youtube.com/@hcegastronomia" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/hce-gastronomia/" },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591842090380",
  },
  { label: "X", href: "https://x.com/hcegastronomia" },
] as const;
