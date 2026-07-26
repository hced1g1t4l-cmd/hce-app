// Inicializacao do Sentry no runtime Node (servidor).
// Fica inerte se nao houver DSN configurado (nao envia nada, nao quebra build).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  // Nao logar dados de requisicao por padrao (privacidade).
  sendDefaultPii: false,
});
