"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Formulario de upload da biblioteca de midia (Frente B).
export function MidiaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [visibilidade, setVisibilidade] = useState("privado");
  const [planoMinimo, setPlanoMinimo] = useState("free");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setOk(null);
    if (!file) {
      setErro("Escolha um arquivo.");
      return;
    }
    setEnviando(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("titulo", titulo);
      fd.append("visibilidade", visibilidade);
      fd.append("planoMinimo", visibilidade === "privado" ? planoMinimo : "free");

      const res = await fetch("/api/adm/midia", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || "Falha no envio.");
        return;
      }
      setOk("Arquivo enviado com sucesso.");
      setFile(null);
      setTitulo("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setErro("Erro de rede. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="rounded-xl border border-line bg-white p-5"
    >
      <h2 className="font-display text-base font-bold text-brand-blue">
        Enviar arquivo
      </h2>
      <p className="mt-1 text-sm text-muted">
        PDFs, e-books (EPUB), planilhas ou imagens — até 50 MB.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-brand-blue">Arquivo</span>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.epub,.xlsx,.xls,.csv,.ods,image/*,application/pdf,application/epub+zip"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-blue file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-amber hover:file:bg-brand-blue-dark"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-brand-blue">
            Título (opcional)
          </span>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Ficha técnica — Molho demi-glace"
            className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-brand-blue">
            Visibilidade
          </span>
          <select
            value={visibilidade}
            onChange={(e) => setVisibilidade(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm"
          >
            <option value="privado">Privado (exige login/plano)</option>
            <option value="publico">Público (qualquer visitante)</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-brand-blue">
            Plano mínimo
          </span>
          <select
            value={planoMinimo}
            onChange={(e) => setPlanoMinimo(e.target.value)}
            disabled={visibilidade === "publico"}
            className="mt-1 block w-full rounded-lg border border-line px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="free">Gratuito (qualquer conta)</option>
            <option value="essencial">Essencial</option>
            <option value="profissional">Profissional</option>
            <option value="premium">Premium</option>
          </select>
        </label>
      </div>

      {erro && <p className="mt-3 text-sm font-medium text-red-600">{erro}</p>}
      {ok && (
        <p className="mt-3 text-sm font-medium text-green-700">{ok}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-5 py-2.5 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar arquivo"}
      </button>
    </form>
  );
}
