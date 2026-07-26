import type { MetadataRoute } from "next";

const BASE_URL = "https://www.hcegastronomia.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Nao indexar area interna nem endpoints de API.
      disallow: ["/adm", "/adm/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
