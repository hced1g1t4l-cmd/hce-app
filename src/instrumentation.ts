import * as Sentry from "@sentry/nextjs";

// Carrega a config do Sentry conforme o runtime (Node ou Edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

// Captura erros de renderizacao do servidor (App Router).
export const onRequestError = Sentry.captureRequestError;
