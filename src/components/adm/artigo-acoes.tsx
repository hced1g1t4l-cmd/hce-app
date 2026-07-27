"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Ações por artigo na lista do /adm/feed: editar, ver no site e excluir.
export function ArtigoAcoes({
  id,
  slug,
  publicado,
}: {
  id: string;
  slug: string;
  publicado: boolean;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!window.confirm("Excluir este artigo? Esta ação não pode ser desfeita.")) {
      return;
    }
    setExcluindo(true);
    const res = await fetch("/api/adm/artigos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setExcluindo(false);
      window.alert("Não foi possível excluir.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/adm/feed/${id}`}
        className="font-semibold text-brand-blue hover:underline"
      >
        Editar
      </Link>
      {publicado && (
        <Link
          href={`/feed/${slug}`}
          target="_blank"
          className="font-semibold text-brand-blue hover:underline"
        >
          Ver
        </Link>
      )}
      <button
        type="button"
        onClick={excluir}
        disabled={excluindo}
        className="font-semibold text-red-600 hover:underline disabled:opacity-60"
      >
        {excluindo ? "Excluindo…" : "Excluir"}
      </button>
    </div>
  );
}
