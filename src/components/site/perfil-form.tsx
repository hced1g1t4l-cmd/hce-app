"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UFS, ESTADO_NA, PAISES } from "@/lib/localidades";

type PerfilInit = {
  bio: string;
  telefone: string;
  cep: string;
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

  const [cepBuscando, setCepBuscando] = useState(false);
  const [cepMsg, setCepMsg] = useState<string | null>(null);

  // Mascara visual do CEP: 00000-000
  function formatarCep(v: string): string {
    const d = v.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  async function buscarCep(valor: string) {
    const cep = valor.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepBuscando(true);
    setCepMsg(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data?.erro) {
        setCepMsg("CEP não encontrado. Você pode preencher manualmente.");
        return;
      }
      setF((v) => ({
        ...v,
        logradouro: data.logradouro || v.logradouro,
        bairro: data.bairro || v.bairro,
        cidade: data.localidade || v.cidade,
        estado: data.uf || v.estado,
        pais: v.pais || "Brasil",
      }));
      setCepMsg("Endereço preenchido pelo CEP. Confira e ajuste o número.");
    } catch {
      setCepMsg("Não foi possível buscar o CEP agora. Preencha manualmente.");
    } finally {
      setCepBuscando(false);
    }
  }

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
        <label className="block sm:col-span-2">
          <span className="font-display text-sm font-semibold text-brand-blue">
            CEP
          </span>
          <input
            value={formatarCep(f.cep)}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 8);
              setF((v) => ({ ...v, cep: d }));
              if (d.length === 8) buscarCep(d);
            }}
            onBlur={(e) => buscarCep(e.target.value)}
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            className="hce-input mt-1.5"
          />
          <span className="mt-1 block text-xs text-muted">
            {cepBuscando
              ? "Buscando endereço…"
              : "Digite o CEP para preencher o endereço automaticamente."}
          </span>
        </label>
        <div className="hidden sm:col-span-4 sm:block" aria-hidden="true" />
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
      {cepMsg && (
        <p className="mt-3 text-xs text-brand-blue">{cepMsg}</p>
      )}

      {/* Redes sociais */}
      <h3 className="mt-8 font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
        Redes sociais
      </h3>
      <div className="mt-4 grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            LinkedIn
          </span>
          <input
            value={f.linkedin}
            onChange={set("linkedin")}
            type="url"
            inputMode="url"
            placeholder="Digite ou cole aqui o link do seu LinkedIn"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Instagram
          </span>
          <input
            value={f.instagram}
            onChange={set("instagram")}
            type="url"
            inputMode="url"
            placeholder="Digite ou cole aqui o link do seu Instagram"
            className="hce-input mt-1.5"
          />
        </label>
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Facebook
          </span>
          <input
            value={f.facebook}
            onChange={set("facebook")}
            type="url"
            inputMode="url"
            placeholder="Digite ou cole aqui o link do seu Facebook"
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
