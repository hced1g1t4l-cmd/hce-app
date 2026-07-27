import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Frente B: armazenamento de midia no Cloudflare R2 (S3-compativel).
// Variaveis de ambiente (Vercel + .env.local):
//   R2_ACCOUNT_ID        -> id da conta Cloudflare (subdominio do endpoint S3)
//   R2_ACCESS_KEY_ID     -> Access Key do token de API do R2
//   R2_SECRET_ACCESS_KEY -> Secret do token de API do R2
//   R2_BUCKET            -> nome do bucket
//   R2_PUBLIC_BASE_URL   -> (opcional) dominio publico do bucket, ex.: https://cdn.hcegastronomia.com
//
// Sem essas variaveis, r2Configured() retorna false e o upload responde 503 com
// mensagem clara (o resto do app segue funcionando).

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = process.env.R2_PUBLIC_BASE_URL;

export function r2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

// Cliente S3 criado sob demanda (lazy) para nao quebrar o build sem envs.
let _client: S3Client | null = null;
function client(): S3Client {
  if (!r2Configured()) {
    throw new Error("R2 não configurado (defina as variáveis R2_*).");
  }
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
    });
  }
  return _client;
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  await client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key }),
  );
}

// URL assinada de GET, valida por poucos minutos. downloadName forca "salvar como".
export async function signedGetUrl(
  key: string,
  { expiresIn = 300, downloadName }: { expiresIn?: number; downloadName?: string } = {},
): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentDisposition: downloadName
      ? `attachment; filename="${encodeURIComponent(downloadName)}"`
      : undefined,
  });
  return getSignedUrl(client(), cmd, { expiresIn });
}

// URL publica estavel via dominio/CDN do bucket (so quando R2_PUBLIC_BASE_URL definido).
export function publicUrl(key: string): string | null {
  if (!publicBase) return null;
  return `${publicBase.replace(/\/$/, "")}/${key}`;
}
