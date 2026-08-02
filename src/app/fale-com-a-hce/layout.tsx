import type { Metadata } from "next";

// A página é client component e não pode exportar metadata; este layout
// fornece título/descrição/canônica próprios (antes herdava os da home).
export const metadata: Metadata = {
  title: "Fale com a HCE · Contato",
  description:
    "Fale com a HCE sobre consultoria, treinamento de equipes, cursos ou parcerias de conteúdo em gastronomia, hospitalidade e gestão de A&B.",
  alternates: { canonical: "/fale-com-a-hce" },
  openGraph: {
    title: "Fale com a HCE · Contato",
    description:
      "Consultoria, treinamento, cursos ou parcerias de conteúdo. Conte seu objetivo e retornaremos o mais breve possível.",
    url: "/fale-com-a-hce",
    type: "website",
  },
};

export default function FaleComAHceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
