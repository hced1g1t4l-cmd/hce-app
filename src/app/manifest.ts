import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
    short_name: "HCE",
    description:
      "Consultoria de restaurantes, educação e conteúdo em gastronomia, hospitalidade e gestão de A&B.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0b1f4d",
    lang: "pt-BR",
    icons: [
      {
        src: "/brand/logos/logo-1x1.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
