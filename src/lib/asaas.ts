// Configuração base do gateway de pagamento Asaas (Clube +HCE — BAC_143).
//
// Este módulo é a FUNDAÇÃO (Fase 1): resolve a URL base pelo ambiente, monta os
// cabeçalhos de autenticação e valida o token do webhook. As chamadas de
// negócio (criar cliente, assinatura, cobrança) entram na Fase 2 (checkout),
// reaproveitando `asaasFetch` daqui.
//
// Segredos vêm SEMPRE de variáveis de ambiente, nunca do código
// (ver regra no-secrets-in-source). Em runtime serverless (Vercel) as chaves
// ficam nas Environment Variables do projeto.

type AsaasEnv = "sandbox" | "production";

const BASES: Record<AsaasEnv, string> = {
  sandbox: "https://api-sandbox.asaas.com/v3",
  production: "https://api.asaas.com/v3",
};

/** Ambiente atual do Asaas (default: sandbox, o mais seguro). */
export function asaasEnv(): AsaasEnv {
  return process.env.ASAAS_ENV === "production" ? "production" : "sandbox";
}

/** URL base da API conforme o ambiente. */
export function asaasBaseUrl(): string {
  return BASES[asaasEnv()];
}

/** True se as variáveis mínimas para operar existem. */
export function asaasConfigurado(): boolean {
  return Boolean(process.env.ASAAS_API_KEY);
}

/** Lê a chave da API; lança erro claro se não estiver configurada. */
export function asaasApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) {
    throw new Error(
      "ASAAS_API_KEY ausente. Defina a chave do Asaas nas variáveis de ambiente.",
    );
  }
  return key;
}

/** Cabeçalhos padrão para chamadas autenticadas à API do Asaas. */
export function asaasHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    access_token: asaasApiKey(),
  };
}

/**
 * Valida o token que o Asaas envia no header `asaas-access-token` de cada
 * notificação de webhook, comparando com ASAAS_WEBHOOK_TOKEN. Retorna false se
 * o segredo não estiver configurado (falha fechada).
 */
export function webhookTokenValido(tokenRecebido: string | null): boolean {
  const esperado = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!esperado || !tokenRecebido) return false;
  return tokenRecebido === esperado;
}

/**
 * Wrapper fino sobre `fetch` para a API do Asaas: injeta base URL e headers.
 * Usado pelas rotas de checkout/webhook na Fase 2. Não lança em status HTTP de
 * erro — quem chama decide o tratamento a partir de `res.ok`.
 */
export async function asaasFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${asaasBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    ...init,
    headers: { ...asaasHeaders(), ...(init?.headers ?? {}) },
  });
}
