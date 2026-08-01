import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { prisma } from "@/lib/db";
import { AdmHeader } from "@/components/adm/adm-header";
import { ArtigoEditor } from "@/components/adm/artigo-editor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

export default async function EditarArtigoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAuthed())) redirect("/adm/login");

  const { id } = await params;
  const artigo = await prisma.artigo.findUnique({ where: { id } });
  if (!artigo) notFound();

  return (
    <main className="min-h-screen bg-surface-soft">
      <AdmHeader active="feed" />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5">
          <Link
            href="/adm/feed"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            ← Voltar para os artigos
          </Link>
          <h1 className="mt-2 font-display text-xl font-bold text-brand-blue">
            Editar artigo
          </h1>
        </div>
        <ArtigoEditor
          initial={{
            id: artigo.id,
            titulo: artigo.titulo,
            slug: artigo.slug,
            resumo: artigo.resumo,
            capaUrl: artigo.capaUrl,
            autor: artigo.autor,
            conteudoHtml: artigo.conteudoHtml,
            galeria: artigo.galeria,
            publicado: artigo.publicado,
          }}
        />
      </div>
    </main>
  );
}
