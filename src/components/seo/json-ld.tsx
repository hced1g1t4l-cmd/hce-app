import { SITE_URL, SITE_NAME, EMAIL_CONTATO, SOCIALS } from "@/lib/site";

// Dados estruturados (schema.org / JSON-LD). Ajudam o Google a entender a
// marca (Organization) e o site (WebSite) — melhora buscas pelo nome
// ("hce gastronomia"), painel de conhecimento e sitelinks.

// Renderiza um bloco JSON-LD com segurança (JSON serializado).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify já escapa aspas; conteúdo é 100% controlado por nós.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization + WebSite (globais, no layout raiz).
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName:
          "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logos/logo-1x1.png`,
        image: `${SITE_URL}/brand/og-image.png`,
        email: EMAIL_CONTATO,
        description:
          "Consultoria de restaurantes, educação e conteúdo em gastronomia, hospitalidade e gestão de A&B. Por Cris Leite e Gio Gropello.",
        founder: [
          { "@type": "Person", name: "Cris Leite" },
          { "@type": "Person", name: "Gio Gropello" },
        ],
        areaServed: "BR",
        knowsAbout: [
          "Gastronomia",
          "Hospitalidade",
          "Consultoria de restaurantes",
          "Gestão de alimentos e bebidas",
          "Educação gastronômica",
        ],
        sameAs: SOCIALS.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
  return <JsonLd data={data} />;
}
