import type { Metadata } from "next";

// Página client component: este layout dá metadata própria (antes herdava a home).
export const metadata: Metadata = {
  title: "Quero ser avisado do lançamento · +HCE",
  description:
    "Cadastre-se para ser avisado do lançamento do +HCE: receitas, fichas técnicas, e-books e comunidade para quem quer evoluir na gastronomia.",
  alternates: { canonical: "/avise-me" },
  openGraph: {
    title: "Quero ser avisado do lançamento · +HCE",
    description:
      "Deixe seus dados e avisaremos você em primeira mão quando o +HCE for lançado.",
    url: "/avise-me",
    type: "website",
  },
};

export default function AviseMeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
