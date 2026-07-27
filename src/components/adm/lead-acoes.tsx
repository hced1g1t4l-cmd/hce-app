"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Editor de observacoes internas (salva inline). Reutilizado por leads e mensagens.
export function LeadObs({
  id,
  inicial,
  endpoint = "/api/adm/leads",
}: {
  id: string;
  inicial: string | null;
  endpoint?: string;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(inicial ?? "");
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, observacoes: valor }),
      });
      if (res.ok) {
        setEditando(false);
        router.refresh();
      }
    } finally {
      setSalvando(false);
    }
  }

  if (!editando) {
    return (
      <button
        type="button"
        onClick={() => setEditando(true)}
        className="max-w-[240px] text-left text-sm text-brand-blue hover:underline"
        title="Clique para editar"
      >
        {valor ? (
          <span className="whitespace-normal text-ink">{valor}</span>
        ) : (
          <span className="text-muted">+ adicionar nota</span>
        )}
      </button>
    );
  }

  return (
    <div className="w-[240px]">
      <textarea
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        rows={3}
        maxLength={2000}
        autoFocus
        placeholder="Anotações internas…"
        className="w-full rounded-lg border border-line px-2 py-1.5 text-sm whitespace-normal"
      />
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="rounded-full bg-brand-blue px-3 py-1 text-xs font-semibold text-brand-amber hover:bg-brand-blue-dark disabled:opacity-60"
        >
          {salvando ? "Salvando…" : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => {
            setValor(inicial ?? "");
            setEditando(false);
          }}
          className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-brand-blue hover:bg-surface-soft"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// Botao de exclusao (com confirmacao). Reutilizado por leads e mensagens.
export function LeadDelete({
  id,
  nome,
  endpoint = "/api/adm/leads",
}: {
  id: string;
  nome: string;
  endpoint?: string;
}) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);

  async function excluir() {
    if (!window.confirm(`Excluir o cadastro de "${nome}"? Não pode ser desfeito.`)) {
      return;
    }
    setExcluindo(true);
    try {
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) router.refresh();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <button
      type="button"
      onClick={excluir}
      disabled={excluindo}
      className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {excluindo ? "Excluindo…" : "Excluir"}
    </button>
  );
}
