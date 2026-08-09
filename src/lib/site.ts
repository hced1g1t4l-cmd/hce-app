// Configuracoes centrais do site HCE (links, contatos, redes).

// WhatsApp removido do site neste primeiro momento (sera adicionado depois,
// quando a HCE tiver o numero/chip oficial). Os CTAs apontam para o
// formulario "Fale com a HCE" (/fale-com-a-hce).

export const SITE_URL = "https://www.hcegastronomia.com";
export const SITE_NAME = "HCE Gastronomia";

export const EMAIL_CONTATO = "contato@hcegastronomia.com";

// Canal para o titular exercer direitos de dados (LGPD). Enquanto não houver
// caixa dedicada (ex.: privacidade@), usamos o e-mail de contato oficial.
export const EMAIL_PRIVACIDADE = "contato@hcegastronomia.com";

/**
 * Identidade jurídica usada nos Termos de Uso e no Aviso de Privacidade.
 *
 * IMPORTANTE: preencha `razaoSocial`, `cnpj` e `endereco` assim que a empresa
 * estiver formalizada. Onde ficarem em branco, os documentos exibem um aviso
 * de "a ser incluído", em vez de dado inventado.
 */
export const EMPRESA = {
  nomeFantasia: "HCE Gastronomia",
  razaoSocial: "", // ex.: "HCE Gastronomia Ltda." — preencher
  cnpj: "", // ex.: "00.000.000/0001-00" — preencher
  endereco: "", // logradouro completo — preencher
  cidadeUf: "Rio de Janeiro/RJ",
  pais: "Brasil",
  foro: "Comarca da Capital do Estado do Rio de Janeiro",
  emailContato: EMAIL_CONTATO,
  emailPrivacidade: EMAIL_PRIVACIDADE,
  // Encarregado(a) pelo tratamento de dados (DPO). Preencha quando nomear.
  encarregado: "", // nome do(a) Encarregado(a) — opcional
} as const;

// Vigência dos documentos legais. Atualize a data e a versão a cada revisão.
export const LEGAL_ATUALIZACAO = "9 de agosto de 2026";
export const LEGAL_VERSAO = "1.0";

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
