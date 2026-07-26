import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const OG_IMAGE = {
  url: "/brand/og-image.png",
  width: 1200,
  height: 630,
  alt: "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hcegastronomia.com"),
  title: {
    default: "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
    template: "%s | HCE Gastronomia",
  },
  description:
    "A HCE une consultoria de restaurantes, educação e conteúdo em gastronomia. Por Cris Leite e Gio Gropello.",
  keywords: [
    "gastronomia",
    "consultoria de restaurantes",
    "hospitalidade",
    "educação gastronômica",
    "treinamento de equipes",
    "alimentos e bebidas",
    "Cris Leite",
    "Gio Gropello",
    "HCE",
  ],
  authors: [{ name: "HCE Gastronomia" }],
  creator: "HCE Gastronomia",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/brand/logos/logo-1x1.png",
    apple: "/brand/logos/logo-1x1.png",
  },
  openGraph: {
    title: "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
    description:
      "Consultoria de restaurantes, educação e conteúdo em gastronomia. Por Cris Leite e Gio Gropello.",
    url: "https://www.hcegastronomia.com",
    siteName: "HCE Gastronomia",
    locale: "pt_BR",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "HCE — Hospitalidade, Consultoria e Educação em Gastronomia",
    description:
      "Consultoria de restaurantes, educação e conteúdo em gastronomia. Por Cris Leite e Gio Gropello.",
    images: [OG_IMAGE.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        {children}
      </body>
    </html>
  );
}
