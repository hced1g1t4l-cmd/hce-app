// Configuracoes centrais do site HCE (links, contatos, redes).

// WhatsApp removido do site neste primeiro momento (sera adicionado depois,
// quando a HCE tiver o numero/chip oficial). Os CTAs apontam para o
// formulario "Fale com a HCE" (/fale-com-a-hce).

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
