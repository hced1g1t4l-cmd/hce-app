import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Content-Security-Policy alinhada a doc oficial do Next.js (Context7 /vercel/next.js).
// Sem nonce (para manter as paginas estaticas), com 'unsafe-inline' onde o Next/
// Tailwind precisam. Libera o Google reCAPTCHA (scripts, iframe e imagens) para
// nao quebrar os formularios /avise-me e /fale-com-a-hce.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.gstatic.com https://www.google.com",
  "font-src 'self'",
  "frame-src https://www.google.com https://recaptcha.net",
  "connect-src 'self' https://www.google.com https://*.sentry.io https://viacep.com.br https://*.r2.cloudflarestorage.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Cabecalhos de seguranca aplicados a todas as rotas.
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
    value: "camera=(self), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // PDFKit le os arquivos de fonte (.afm) via fs a partir do seu __dirname.
  // Mantendo-o como pacote externo (nao empacotado pelo bundler), o __dirname
  // aponta para node_modules/pdfkit real e os .afm sao encontrados em runtime.
  serverExternalPackages: ["pdfkit"],
  // Reforco: garante que os .afm sejam incluidos no bundle serverless da Vercel.
  outputFileTracingIncludes: {
    "/api/adm/export/**": [
      "./node_modules/pdfkit/js/data/*.afm",
      "./node_modules/.pnpm/**/pdfkit/js/data/*.afm",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Envolve a config com o Sentry. Sem SENTRY_AUTH_TOKEN, o upload de source maps
// e desligado (build normal); o monitoramento em runtime depende so do DSN.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  disableLogger: true,
});
