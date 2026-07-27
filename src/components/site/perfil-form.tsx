"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UFS, ESTADO_NA, PAISES } from "@/lib/localidades";

type PerfilInit = {
  bio: string;
  telefone: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
  linkedin: string;
  instagram: string;
  facebook: string;
};

export function PerfilForm({ init }: { init: PerfilInit }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [f, setF] = useState<PerfilInit>(init);
  const set = (campo: keyof PerfilInit) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setF((v) => ({ ...v, [campo]: e.target.value }));

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    setSalvando(true);
    try {
      const res = await fetch("/api/conta/perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || "Não foi possível salvar.");
        return;
      }
      setOk("Perfil salvo com sucesso.");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={salvar}
      className="mt-6 rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
        Meu perfil
      </h2>

      <div className="mt-5 grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Bio <span className="font-normal text-muted">(opcional)</span>
          </span>
          <textarea
            value={f.bio}
            onChange={set("bio")}
            rows={3}
            maxLength={600}
            placeholder="Conte um pouco sobre você e sua trajetória na gastronomia."
            className="hce-input mt-1.5 resize-y"
          />
        </label>

        <label className="block sm:max-w-xs">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Telefone
          </span>
          <input
            value={f.telefone}
            onChange={set("telefone")}
            type="tel"
            autoComplete="tel"
            placeholder="(21) 90000-0000"
            className="hce-input mt-1.5"
          />
        </label>
      </div>

      {/* Endereço */}
      <h3 className="mt-8 font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
        Endereço
      </h3>
      <div className="mt-4 grid gap-5 sm:grid-cols-6">
        <label className="block sm:col-span-4">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Logradouro
          </span>
          <input
            value={f.logradouro}
            onChange={set("logradouro")}
            type="text"
            autoComplete="address-line1"
            placeholder="Rua, avenida…"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Número
          </span>
          <input
            value={f.numero}
            onChange={set("numero")}
            type="text"
            placeholder="Nº"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-3">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Complemento
          </span>
          <input
            value={f.complemento}
            onChange={set("complemento")}
            type="text"
            autoComplete="address-line2"
            placeholder="Apto, bloco, sala…"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-3">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Bairro
          </span>
          <input
            value={f.bairro}
            onChange={set("bairro")}
            type="text"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-3">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Cidade
          </span>
          <input
            value={f.cidade}
            onChange={set("cidade")}
            type="text"
            autoComplete="address-level2"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block sm:col-span-3">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Estado
          </span>
          <select
            value={f.estado}
            onChange={set("estado")}
            className="hce-input mt-1.5"
          >
            <option value="">Selecione…</option>
            <option value={ESTADO_NA}>Não se aplica</option>
            {UFS.map((u) => (
              <option key={u.sigla} value={u.sigla}>
                {u.sigla} — {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-3">
          <span className="font-display text-sm font-semibold text-brand-blue">
            País
          </span>
          <select
            value={f.pais}
            onChange={set("pais")}
            className="hce-input mt-1.5"
          >
            <option value="">Selecione…</option>
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Redes sociais */}
      <h3 className="mt-8 font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
        Redes sociais
      </h3>
      <div className="mt-4 grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            LinkedIn <span className="font-normal text-muted">(link)</span>
          </span>
          <input
            value={f.linkedin}
            onChange={set("linkedin")}
            type="url"
            inputMode="url"
            placeholder="https://linkedin.com/in/seu-perfil"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Instagram <span className="font-normal text-muted">(link)</span>
          </span>
          <input
            value={f.instagram}
            onChange={set("instagram")}
            type="url"
            inputMode="url"
            placeholder="https://instagram.com/seu-perfil"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Facebook <span className="font-normal text-muted">(link)</span>
          </span>
          <input
            value={f.facebook}
            onChange={set("facebook")}
            type="url"
            inputMode="url"
            placeholder="https://facebook.com/seu-perfil"
            className="hce-input mt-1.5"
          />
        </label>
      </div>

      {erro && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </p>
      )}
      {ok && (
        <p className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {ok}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-brand-amber px-6 py-3 text-center font-display text-base font-semibold text-brand-blue-deep transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salvando ? "Salvando…" : "Salvar perfil"}
      </button>
    </form>
  );
}
