"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PerfilEmailsForm({
  emailPrincipal,
  emailSecundario,
}: {
  emailPrincipal: string | null;
  emailSecundario: string | null;
}) {
  const router = useRouter();
  const [principal, setPrincipal] = useState(emailPrincipal ?? "");
  const [secundario, setSecundario] = useState(emailSecundario ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(false);
    setSalvando(true);
    try {
      const res = await fetch("/api/adm/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailPrincipal: principal.trim(),
          emailSecundario: secundario.trim(),
        }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErro(d.error || "Não foi possível salvar.");
        setSalvando(false);
        return;
      }
      setOk(true);
      setSalvando(false);
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold text-brand-blue">
          E-mail principal (resgate)
        </span>
        <input
          type="email"
          value={principal}
          onChange={(e) => setPrincipal(e.target.value)}
          placeholder="seu@email.com"
          className="hce-input mt-1.5"
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-brand-blue">
          E-mail secundário{" "}
          <span className="font-normal text-muted">(opcional)</span>
        </span>
        <input
          type="email"
          value={secundario}
          onChange={(e) => setSecundario(e.target.value)}
          placeholder="alternativo@email.com"
          className="hce-input mt-1.5"
        />
      </label>

      <p className="text-xs text-muted">
        Usamos esses e-mails apenas para enviar o link de recuperação de senha,
        a partir de <strong>naoresponda@hcegastronomia.com</strong>.
      </p>

      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}
      {ok && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          E-mails de resgate salvos.
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {salvando ? "Salvando…" : "Salvar e-mails"}
      </button>
    </form>
  );
}
