"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SairButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await fetch("/api/conta/sair", { method: "POST" }).catch(() => null);
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={sair}
      disabled={saindo}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
    >
      {saindo ? "Saindo…" : "Sair da conta"}
    </button>
  );
}
