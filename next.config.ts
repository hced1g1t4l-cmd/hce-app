import type { NextConfig } from "next";

// Cabecalhos de seguranca aplicados a todas as rotas.
// - HSTS: forca HTTPS no navegador (a Cloudflare/Vercel ja servem TLS).
// - X-Frame-Options / frame-ancestors: impede que o site seja embutido em
//   iframes (protege contra clickjacking, principalmente o painel /adm).
// - X-Content-Type-Options: impede "MIME sniffing".
// - Referrer-Policy: nao vaza a URL completa para outros sites.
// - Permissions-Policy: desliga APIs sensiveis do navegador que nao usamos.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none';",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
