import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import {
  DepoimentosEditor,
  type DepoimentoRow,
} from "@/components/adm/depoimentos-editor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

const fmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export default async function AdmDepoimentosPage() {
  await requireAdmin();

  const rows = await prisma.depoimento.findMany({
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });

  const itens: DepoimentoRow[] = rows.map((d) => ({
    id: d.id,
    nome: d.nome,
    cargo: d.cargo,
    texto: d.texto,
    fotoUrl: d.fotoUrl,
    formato: d.formato,
    ordem: d.ordem,
    publicado: d.publicado,
    criadoPorNome: d.criadoPorNome,
    criadoFmt: fmt.format(d.createdAt),
  }));

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Depoimentos
          </h1>
          <p className="text-sm text-muted">
            Curadoria dos depoimentos exibidos na{" "}
            <a
              href="/#depoimentos"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-blue hover:underline"
            >
              home
            </a>
            . Escolha o que entra, a ordem e o formato — sem depender de deploy.
          </p>
        </div>

        <DepoimentosEditor itens={itens} />
      </div>
    </main>
  );
}
