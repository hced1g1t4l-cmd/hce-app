import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { r2Configured } from "@/lib/storage";
import { PLANO_LABEL, type Plano } from "@/lib/planos";
import { AdmHeader } from "@/components/adm/adm-header";
import { MidiaUploader } from "@/components/adm/midia-uploader";
import { MidiaAcoes } from "@/components/adm/midia-acoes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

const TIPO_LABEL: Record<string, string> = {
  imagem: "Imagem",
  pdf: "PDF",
  ebook: "E-book",
  planilha: "Planilha",
  outro: "Outro",
};

function tamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdmMidiaPage() {
  if (!(await isAuthed())) redirect("/adm/login");

  const configurado = r2Configured();
  const itens = configurado
    ? await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="midia" />

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Biblioteca de mídia
          </h1>
          <p className="text-sm text-muted">
            Fichas técnicas, e-books, planilhas e imagens do +HCE, guardados no
            Cloudflare R2 e entregues com link seguro.
          </p>
        </div>

        {!configurado ? (
          <div className="rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-6">
            <h2 className="font-display text-base font-bold text-brand-blue">
              Armazenamento ainda não configurado
            </h2>
            <p className="mt-2 text-sm text-brand-blue/80">
              Para habilitar os uploads, crie um bucket no Cloudflare R2 e
              defina as variáveis <code>R2_ACCOUNT_ID</code>,{" "}
              <code>R2_ACCESS_KEY_ID</code>, <code>R2_SECRET_ACCESS_KEY</code> e{" "}
              <code>R2_BUCKET</code> na Vercel. Depois, faça um novo deploy.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
            <MidiaUploader />

            <div>
              <p className="mb-2 text-sm text-muted">
                {itens.length}{" "}
                {itens.length === 1 ? "arquivo" : "arquivos"} na biblioteca
              </p>
              {itens.length === 0 ? (
                <p className="rounded-xl border border-line bg-white p-8 text-center text-muted">
                  Nenhum arquivo ainda. Envie o primeiro no formulário ao lado.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-line bg-white">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
                        <th className="px-4 py-3 font-semibold">Arquivo</th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">
                          Tipo
                        </th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">
                          Acesso
                        </th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">
                          Tamanho
                        </th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">
                          Enviado
                        </th>
                        <th className="px-4 py-3 font-semibold whitespace-nowrap">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((m) => (
                        <tr key={m.id} className="border-b border-line/70">
                          <td className="px-4 py-3">
                            <span className="font-medium text-brand-blue">
                              {m.titulo || m.filename}
                            </span>
                            {m.titulo && (
                              <span className="block text-xs text-muted">
                                {m.filename}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted">
                            {TIPO_LABEL[m.tipo] ?? m.tipo}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {m.visibilidade === "publico" ? (
                              <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                                Público
                              </span>
                            ) : (
                              <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                                {PLANO_LABEL[m.planoMinimo as Plano] ??
                                  m.planoMinimo}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted">
                            {tamanho(m.tamanho)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted">
                            {fmt.format(m.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <MidiaAcoes id={m.id} filename={m.filename} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
