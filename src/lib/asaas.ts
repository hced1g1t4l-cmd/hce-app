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

// ---------------------------------------------------------------------------
// Fase 2 — operacoes de checkout (cliente, assinatura, cobranca, Pix).
//
// Cada helper e um wrapper fino sobre `asaasFetch`, com tipos minimos do que o
// app realmente usa. Em erro HTTP lancamos `AsaasError` carregando status +
// corpo, para a rota decidir a mensagem ao usuario sem vazar detalhes crus.
// ---------------------------------------------------------------------------

export type AsaasBillingType = "PIX" | "CREDIT_CARD" | "BOLETO" | "UNDEFINED";
export type AsaasCycle =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

/** Erro de chamada ao Asaas: guarda status HTTP e corpo para diagnostico. */
export class AsaasError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "AsaasError";
    this.status = status;
    this.body = body;
  }
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/** Extrai a 1a descricao de erro do Asaas ({ errors: [{ description }] }). */
export function asaasErroDescricao(body: unknown): string | null {
  if (
    body &&
    typeof body === "object" &&
    "errors" in body &&
    Array.isArray((body as { errors: unknown[] }).errors)
  ) {
    const first = (body as { errors: Array<{ description?: string }> })
      .errors[0];
    return first?.description ?? null;
  }
  return null;
}

export type AsaasCustomer = {
  id: string;
  name?: string;
  email?: string;
  cpfCnpj?: string;
};

/** Cria (ou reidentifica) um cliente no Asaas. cpfCnpj so digitos. */
export async function asaasCriarCliente(input: {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone?: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  const res = await asaasFetch("/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const body = await parseJson(res);
  if (!res.ok) {
    throw new AsaasError("Falha ao criar cliente no Asaas", res.status, body);
  }
  return body as AsaasCustomer;
}

export type AsaasSubscription = {
  id: string;
  status: string;
  customer: string;
  value: number;
  cycle: string;
  billingType: string;
};

/** Cria uma assinatura recorrente. `value` em reais; `nextDueDate` YYYY-MM-DD. */
export async function asaasCriarAssinatura(input: {
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  nextDueDate: string;
  cycle: AsaasCycle;
  description: string;
  externalReference?: string;
}): Promise<AsaasSubscription> {
  const res = await asaasFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const body = await parseJson(res);
  if (!res.ok) {
    throw new AsaasError("Falha ao criar assinatura no Asaas", res.status, body);
  }
  return body as AsaasSubscription;
}

export type AsaasPayment = {
  id: string;
  status: string;
  value: number;
  billingType: string;
  dueDate: string;
  invoiceUrl?: string;
  subscription?: string;
};

/** Lista as cobrancas geradas por uma assinatura (a 1a e a do 1o ciclo). */
export async function asaasPagamentosDaAssinatura(
  subscriptionId: string,
): Promise<AsaasPayment[]> {
  const res = await asaasFetch(`/subscriptions/${subscriptionId}/payments`, {
    method: "GET",
  });
  const body = await parseJson(res);
  if (!res.ok) {
    throw new AsaasError("Falha ao ler cobrancas da assinatura", res.status, body);
  }
  const data = (body as { data?: AsaasPayment[] })?.data;
  return Array.isArray(data) ? data : [];
}

export type AsaasPixQr = {
  encodedImage: string; // PNG em base64 (sem prefixo data:)
  payload: string; // copia-e-cola
  expirationDate?: string;
};

/** QR Pix de uma cobranca. Retorna null se ainda nao disponivel. */
export async function asaasPixQrCode(
  paymentId: string,
): Promise<AsaasPixQr | null> {
  const res = await asaasFetch(`/payments/${paymentId}/pixQrCode`, {
    method: "GET",
  });
  if (!res.ok) return null;
  const body = await parseJson(res);
  const qr = body as Partial<AsaasPixQr>;
  if (!qr?.encodedImage || !qr?.payload) return null;
  return {
    encodedImage: qr.encodedImage,
    payload: qr.payload,
    expirationDate: qr.expirationDate,
  };
}
