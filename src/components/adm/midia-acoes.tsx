"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Acoes por arquivo na biblioteca de midia: copiar link publico, abrir e excluir.
export function MidiaAcoes({
  id,
  filename,
}: {
  id: string;
  filename: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const url = `${window.location.origin}/api/midia/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      window.prompt("Copie o link:", url);
    }
  }

  async function excluir() {
    if (!window.confirm(`Excluir "${filename}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setExcluindo(true);
    try {
      const res = await fetch("/api/adm/midia", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || "Falha ao excluir.");
        return;
      }
      router.refresh();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <a
        href={`/api/adm/midia/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        Abrir
      </a>
      <button
        type="button"
        onClick={copiar}
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        {copiado ? "Copiado!" : "Copiar link"}
      </button>
      <button
        type="button"
        onClick={excluir}
        disabled={excluindo}
        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
      >
        {excluindo ? "Excluindo…" : "Excluir"}
      </button>
    </div>
  );
}
