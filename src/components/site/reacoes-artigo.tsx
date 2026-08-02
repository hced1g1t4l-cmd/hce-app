"use client";

import { useState } from "react";
import {
  REACOES,
  type ContagemReacoes,
  type ReacaoTipo,
} from "@/lib/reacoes";

// Barra de reacoes ao fim do artigo (estilo LinkedIn). Uma reacao por usuario;
// clicar de novo remove. Atualiza a contagem de forma otimista.
export function ReacoesArtigo({
  artigoId,
  contagemInicial,
  minhaInicial,
}: {
  artigoId: string;
  contagemInicial: ContagemReacoes;
  minhaInicial: ReacaoTipo | null;
}) {
  const [contagem, setContagem] = useState<ContagemReacoes>(contagemInicial);
  const [minha, setMinha] = useState<ReacaoTipo | null>(minhaInicial);
  const [enviando, setEnviando] = useState<ReacaoTipo | null>(null);

  const total = REACOES.reduce((s, r) => s + contagem[r.tipo], 0);

  async function reagir(tipo: ReacaoTipo) {
    if (enviando) return;
    setEnviando(tipo);
    try {
      const res = await fetch("/api/feed/reacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artigoId, tipo }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        minha?: ReacaoTipo | null;
        contagem?: ContagemReacoes;
      };
      if (res.ok && data.contagem) {
        setContagem(data.contagem);
        setMinha(data.minha ?? null);
      }
    } catch {
      // silencioso: mantem estado atual
    } finally {
      setEnviando(null);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
        O que você achou?
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {REACOES.map((r) => {
          const ativo = minha === r.tipo;
          return (
            <button
              key={r.tipo}
              type="button"
              onClick={() => reagir(r.tipo)}
              disabled={enviando !== null}
              aria-pressed={ativo}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 ${
                ativo
                  ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                  : "border-line bg-surface-soft text-ink hover:-translate-y-0.5 hover:border-brand-blue/40"
              }`}
            >
              <span aria-hidden className="text-base leading-none">
                {r.emoji}
              </span>
              <span>{r.label}</span>
              {contagem[r.tipo] > 0 && (
                <span
                  className={`ml-0.5 rounded-full px-1.5 text-xs ${
                    ativo ? "bg-white/25 text-white" : "bg-white text-muted"
                  }`}
                >
                  {contagem[r.tipo]}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted">
        {total > 0
          ? `${total} ${total === 1 ? "reação" : "reações"} neste artigo.`
          : "Seja o primeiro a reagir."}
      </p>
    </div>
  );
}
