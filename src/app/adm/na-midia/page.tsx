import { requireAdmin } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { NaMidiaEditor, type MidiaRow } from "@/components/adm/na-midia-editor";
import { ehMidiaTipo, parseLinksExtras } from "@/lib/na-midia";

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

export default async function AdmNaMidiaPage() {
  await requireAdmin();

  const rows = await prisma.midiaItem.findMany({
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });

  const itens: MidiaRow[] = rows.map((r) => ({
    id: r.id,
    tipo: ehMidiaTipo(r.tipo) ? r.tipo : "Artigo",
    veiculo: r.veiculo,
    autor: r.autor,
    titulo: r.titulo,
    descricao: r.descricao,
    url: r.url,
    linksExtras: parseLinksExtras(r.linksExtras),
    thumbUrl: r.thumbUrl,
    thumbPos: r.thumbPos,
    avatarUrl: r.avatarUrl,
    logoVeiculo: r.logoVeiculo,
    logoAlt: r.logoAlt,
    logoClasse: r.logoClasse,
    ordem: r.ordem,
    publicado: r.publicado,
    criadoPorNome: r.criadoPorNome,
    criadoFmt: fmt.format(r.createdAt),
  }));

  return (
    <main className="min-h-screen bg-surface-soft">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold text-brand-blue">
            Na Mídia
          </h1>
          <p className="text-sm text-muted">
            Cards da seção pública{" "}
            <a
              href="/na-midia"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-blue hover:underline"
            >
              /na-midia
            </a>
            . Crie, edite, reordene e publique sem precisar de deploy.
          </p>
        </div>

        <NaMidiaEditor itens={itens} />
      </div>
    </main>
  );
}
