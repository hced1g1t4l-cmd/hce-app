"use client";

import { useEffect, useRef, useState } from "react";

// Botao "Exportar" com menu de formatos (CSV / Excel / PDF).
// tipo: "leads" | "contatos" (define a origem dos dados na API).
export function ExportButtons({ tipo }: { tipo: "leads" | "contatos" }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [aberto]);

  const base = `/api/adm/export/${tipo}`;
  const opcoes: { fmt: string; label: string }[] = [
    { fmt: "csv", label: "CSV" },
    { fmt: "xls", label: "Excel (.xls)" },
    { fmt: "pdf", label: "PDF (papel timbrado)" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark"
      >
        Exportar
        <span aria-hidden className="text-xs">
          ▾
        </span>
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {opcoes.map((o) => (
            <a
              key={o.fmt}
              href={`${base}?fmt=${o.fmt}`}
              role="menuitem"
              onClick={() => setAberto(false)}
              className="block px-4 py-2.5 text-sm font-medium text-brand-blue transition-colors hover:bg-surface-soft"
            >
              {o.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
