import Link from "next/link";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adm";
import { AdmHeader } from "@/components/adm/adm-header";
import { ArtigoEditor } from "@/components/adm/artigo-editor";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata = { robots: { index: false, follow: false } };

export default async function NovoArtigoPage() {
  if (!(await isAuthed())) redirect("/adm/login");

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
            Novo artigo
          </h1>
        </div>
        <ArtigoEditor />
      </div>
    </main>
  );
}
