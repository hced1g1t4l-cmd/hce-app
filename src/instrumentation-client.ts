// Inicializacao do Sentry no navegador. Inerte sem DSN publico.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  // Session Replay desligado por ora (pode ligar depois se quiser).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});

// Instrumenta as transicoes de rota do App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
