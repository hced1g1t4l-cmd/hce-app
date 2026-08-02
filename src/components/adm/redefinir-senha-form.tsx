"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const REGRAS: { id: string; label: string; ok: (s: string) => boolean }[] = [
  { id: "len", label: "Pelo menos 6 caracteres", ok: (s) => s.length >= 6 },
  { id: "up", label: "Uma letra maiúscula", ok: (s) => /[A-Z]/.test(s) },
  { id: "low", label: "Uma letra minúscula", ok: (s) => /[a-z]/.test(s) },
  { id: "num", label: "Um número", ok: (s) => /[0-9]/.test(s) },
  {
    id: "spec",
    label: "Um caractere especial",
    ok: (s) => /[^A-Za-z0-9]/.test(s),
  },
];

export function RedefinirSenhaForm({ token }: { token: string }) {
  const router = useRouter();
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const validacoes = useMemo(
    () => REGRAS.map((r) => ({ ...r, passou: r.ok(nova) })),
    [nova],
  );
  const todasOk = validacoes.every((r) => r.passou);
  const confereOk = confirmar.length > 0 && confirmar === nova;
  const podeEnviar = todasOk && confereOk && !enviando;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!podeEnviar) return;
    setEnviando(true);
    try {
      const res = await fetch("/api/adm/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nova, confirmar }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErro(d.error || "Não foi possível redefinir a senha.");
        setEnviando(false);
        return;
      }
      setOk(true);
      setTimeout(() => router.push("/adm/login"), 1800);
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  if (ok) {
    return (
      <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
        Senha redefinida com sucesso! Redirecionando para o login…
      </p>
    );
  }

  return (
    <form onSubmit={enviar} className="mt-6 space-y-4">
      <label className="block">
        <span className="font-display text-sm font-semibold text-brand-blue">
          Nova senha
        </span>
        <div className="relative mt-1.5">
          <input
            type={ver ? "text" : "password"}
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            autoComplete="new-password"
            className="hce-input pr-11"
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar senha" : "Mostrar senha"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-brand-blue"
          >
            {ver ? "Ocultar" : "Ver"}
          </button>
        </div>
      </label>

      <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {validacoes.map((r) => (
          <li
            key={r.id}
            className={
              "flex items-center gap-2 text-xs " +
              (r.passou ? "text-green-600" : "text-muted")
            }
          >
            <span aria-hidden>{r.passou ? "✓" : "○"}</span>
            {r.label}
          </li>
        ))}
      </ul>

      <label className="block">
        <span className="font-display text-sm font-semibold text-brand-blue">
          Confirmar nova senha
        </span>
        <input
          type={ver ? "text" : "password"}
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          autoComplete="new-password"
          className="hce-input mt-1.5"
        />
        {confirmar.length > 0 && (
          <span
            className={
              "mt-1 block text-xs " +
              (confereOk ? "text-green-600" : "text-red-600")
            }
          >
            {confereOk ? "As senhas conferem." : "As senhas não conferem."}
          </span>
        )}
      </label>

      {erro && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={!podeEnviar}
        className="w-full rounded-full bg-brand-blue px-6 py-3 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {enviando ? "Salvando…" : "Redefinir senha"}
      </button>
    </form>
  );
}
