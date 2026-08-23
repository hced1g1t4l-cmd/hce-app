"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type DepoimentoRow = {
  id: string;
  nome: string;
  cargo: string;
  texto: string;
  fotoUrl: string | null;
  formato: string;
  ordem: number;
  publicado: boolean;
  criadoPorNome: string;
  criadoFmt: string;
};

type FormState = {
  id?: string;
  nome: string;
  cargo: string;
  texto: string;
  fotoUrl: string;
  formato: string;
  publicado: boolean;
};

const FORMATOS: { value: string; label: string }[] = [
  { value: "texto", label: "Texto" },
  { value: "imagem", label: "Texto + imagem" },
  { value: "video", label: "Vídeo (em breve)" },
];

function vazio(): FormState {
  return {
    nome: "",
    cargo: "",
    texto: "",
    fotoUrl: "",
    formato: "texto",
    publicado: true,
  };
}

function deRow(r: DepoimentoRow): FormState {
  return {
    id: r.id,
    nome: r.nome,
    cargo: r.cargo,
    texto: r.texto,
    fotoUrl: r.fotoUrl ?? "",
    formato: r.formato || "texto",
    publicado: r.publicado,
  };
}

function iniciais(nome: string): string {
  return (
    nome
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

async function enviarImagem(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/adm/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Falha no upload da imagem.");
  return data.url as string;
}

export function DepoimentosEditor({ itens }: { itens: DepoimentoRow[] }) {
  const router = useRouter();
  const [lista, setLista] = useState<DepoimentoRow[]>(itens);
  const [form, setForm] = useState<FormState | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    setLista(itens);
  }, [itens]);

  const abrirNovo = useCallback(() => setForm(vazio()), []);
  const abrirEdicao = useCallback((r: DepoimentoRow) => setForm(deRow(r)), []);

  async function togglePublicado(r: DepoimentoRow) {
    setOcupado(r.id);
    setLista((l) =>
      l.map((x) => (x.id === r.id ? { ...x, publicado: !x.publicado } : x)),
    );
    try {
      const res = await fetch("/api/adm/depoimentos", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: r.id, publicado: !r.publicado }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setLista(itens);
      alert("Não foi possível alterar a publicação.");
    } finally {
      setOcupado(null);
    }
  }

  async function excluir(r: DepoimentoRow) {
    if (!confirm(`Excluir o depoimento de "${r.nome}"?`)) return;
    setOcupado(r.id);
    try {
      const res = await fetch("/api/adm/depoimentos", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      if (!res.ok) throw new Error();
      setLista((l) => l.filter((x) => x.id !== r.id));
      router.refresh();
    } catch {
      alert("Não foi possível excluir o depoimento.");
    } finally {
      setOcupado(null);
    }
  }

  async function mover(index: number, dir: -1 | 1) {
    const alvo = index + dir;
    if (alvo < 0 || alvo >= lista.length) return;
    const nova = [...lista];
    [nova[index], nova[alvo]] = [nova[alvo], nova[index]];
    setLista(nova);
    try {
      const res = await fetch("/api/adm/depoimentos/ordem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: nova.map((x) => x.id) }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setLista(itens);
      alert("Não foi possível reordenar.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {lista.length} {lista.length === 1 ? "depoimento" : "depoimentos"}
          {lista.length > 0 && (
            <>
              {" · "}
              {lista.filter((x) => x.publicado).length} publicado(s)
            </>
          )}
        </p>
        <button
          type="button"
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 rounded-full bg-brand-amber px-5 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark"
        >
          + Novo depoimento
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-line bg-white p-10 text-center text-muted">
          Nenhum depoimento ainda. Clique em <strong>Novo depoimento</strong>{" "}
          para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {lista.map((r, i) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-3 sm:flex-nowrap"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => mover(i, -1)}
                  disabled={i === 0}
                  aria-label="Mover para cima"
                  className="rounded-md border border-line px-2 py-0.5 text-xs text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => mover(i, 1)}
                  disabled={i === lista.length - 1}
                  aria-label="Mover para baixo"
                  className="rounded-md border border-line px-2 py-0.5 text-xs text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-30"
                >
                  ▼
                </button>
              </div>

              {r.fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.fotoUrl}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full border border-line object-cover object-top"
                />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-brand-amber">
                  {iniciais(r.nome)}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {r.publicado ? (
                    <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs font-semibold text-muted">
                      Rascunho
                    </span>
                  )}
                  <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    {FORMATOS.find((f) => f.value === r.formato)?.label ??
                      r.formato}
                  </span>
                </div>
                <p className="mt-1 truncate font-semibold text-brand-blue">
                  {r.nome}
                </p>
                <p className="truncate text-xs text-muted">
                  {r.cargo || "—"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => togglePublicado(r)}
                  disabled={ocupado === r.id}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                >
                  {r.publicado ? "Despublicar" : "Publicar"}
                </button>
                <button
                  type="button"
                  onClick={() => abrirEdicao(r)}
                  className="rounded-full border border-brand-blue px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => excluir(r)}
                  disabled={ocupado === r.id}
                  className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {form && (
        <FormularioDepoimento
          form={form}
          setForm={setForm as (f: FormState) => void}
          onFechar={() => setForm(null)}
          onSalvo={() => {
            setForm(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ————————————————————— Formulário (modal) —————————————————————

function FormularioDepoimento({
  form,
  setForm,
  onFechar,
  onSalvo,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onFechar: () => void;
  onSalvo: () => void;
}) {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fotoBusy, setFotoBusy] = useState(false);
  const fotoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onFechar]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm({ ...form, [k]: v });

  async function subirFoto(file: File) {
    setFotoBusy(true);
    setErro(null);
    try {
      const url = await enviarImagem(file);
      set("fotoUrl", url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setFotoBusy(false);
    }
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const payload = {
      id: form.id,
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      texto: form.texto.trim(),
      fotoUrl: form.fotoUrl || null,
      formato: form.formato,
      publicado: form.publicado,
    };
    try {
      const res = await fetch("/api/adm/depoimentos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível salvar.");
      onSalvo();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 pb-3 text-white">
          <h2 className="font-display text-lg font-bold">
            {form.id ? "Editar depoimento" : "Novo depoimento"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Fechar ✕
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto rounded-2xl bg-white p-4 lg:grid-cols-[1fr_360px]">
          {/* FORM */}
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Nome">
                <input
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  placeholder="Nome de quem depõe"
                  className="hce-input"
                  maxLength={160}
                />
              </Campo>
              <Campo label="Cargo / contexto">
                <input
                  value={form.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                  placeholder="Ex.: Chef · Restaurante X"
                  className="hce-input"
                  maxLength={200}
                />
              </Campo>
            </div>

            <Campo label="Depoimento">
              <textarea
                value={form.texto}
                onChange={(e) => set("texto", e.target.value)}
                placeholder="Texto do depoimento. Pode usar parágrafos."
                className="hce-input min-h-40 resize-y whitespace-pre-line"
                maxLength={4000}
              />
              <span className="mt-1 block text-right text-xs text-muted">
                {form.texto.length}/4000
              </span>
            </Campo>

            <Grupo titulo="Foto (avatar)">
              <div className="flex flex-wrap items-center gap-3">
                {form.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.fotoUrl}
                    alt=""
                    className="h-14 w-14 rounded-full border border-line object-cover object-top"
                  />
                ) : (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-sm font-bold text-brand-amber">
                    {iniciais(form.nome || "?")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fotoInput.current?.click()}
                  disabled={fotoBusy}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                >
                  {fotoBusy ? "Enviando…" : "Enviar foto"}
                </button>
                {form.fotoUrl && (
                  <button
                    type="button"
                    onClick={() => set("fotoUrl", "")}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
                <input
                  ref={fotoInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirFoto(f);
                    e.target.value = "";
                  }}
                />
              </div>
              <p className="text-xs text-muted">
                Sem foto, o card mostra as iniciais do nome.
              </p>
            </Grupo>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Formato">
                <select
                  value={form.formato}
                  onChange={(e) => set("formato", e.target.value)}
                  className="hce-input"
                >
                  {FORMATOS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Campo>
              <label className="flex items-end gap-2 pb-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.publicado}
                  onChange={(e) => set("publicado", e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-brand-blue"
                />
                Publicado (visível na home)
              </label>
            </div>

            {erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </p>
            )}
          </div>

          {/* PREVIEW */}
          <aside className="min-w-0">
            <p className="mb-2 font-display text-xs font-bold tracking-wide text-brand-blue uppercase">
              Pré-visualização
            </p>
            <div className="rounded-2xl bg-surface-soft p-4">
              <PreviewCard form={form} />
            </div>
          </aside>
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onFechar}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={salvar}
            disabled={salvando}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-6 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
          >
            {salvando
              ? "Salvando…"
              : form.id
                ? "Salvar alterações"
                : "Criar depoimento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ form }: { form: FormState }) {
  const nome = form.nome || "Nome";
  const cargo = form.cargo || "Cargo · contexto";
  const texto = form.texto || "O texto do depoimento aparece aqui…";
  return (
    <figure className="flex h-[23rem] flex-col rounded-2xl border border-line bg-white p-6 shadow-brand">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-8 w-8 shrink-0 text-brand-amber"
        fill="currentColor"
      >
        <path d="M9.5 6C6.46 6 4 8.46 4 11.5V18h6v-6H7.2c0-1.55 1.05-2.8 2.3-2.8V6zm10 0C16.46 6 14 8.46 14 11.5V18h6v-6h-2.8c0-1.55 1.05-2.8 2.3-2.8V6z" />
      </svg>
      <blockquote className="mt-3 line-clamp-6 leading-relaxed whitespace-pre-line text-ink">
        {texto}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3.5 border-t border-line pt-5">
        {form.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.fotoUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-full object-cover object-top ring-2 ring-brand-amber/40"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-blue font-display font-bold text-brand-amber ring-2 ring-brand-amber/40">
            {iniciais(nome)}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-display font-bold text-brand-blue">{nome}</p>
          <p className="text-sm leading-snug text-muted">{cargo}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function Grupo({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface-soft p-3">
      <h3 className="font-display text-xs font-bold tracking-wide text-brand-blue uppercase">
        {titulo}
      </h3>
      <div className="mt-2 space-y-2.5">{children}</div>
    </div>
  );
}
