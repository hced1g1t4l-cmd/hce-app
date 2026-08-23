"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CardMidia } from "@/components/site/midia-card";
import {
  MIDIA_TIPOS,
  AVATARES_PRESET,
  LOGOS_PRESET,
  type LinkExtra,
  type MidiaTipo,
  type MidiaCard,
} from "@/lib/na-midia";

export type MidiaRow = {
  id: string;
  tipo: MidiaTipo;
  veiculo: string;
  autor: string;
  titulo: string;
  descricao: string;
  url: string;
  linksExtras: LinkExtra[];
  thumbUrl: string | null;
  thumbPos: string | null;
  avatarUrl: string | null;
  logoVeiculo: string | null;
  logoAlt: string | null;
  logoClasse: string | null;
  ordem: number;
  publicado: boolean;
  criadoPorNome: string;
  criadoFmt: string;
};

type FormState = {
  id?: string;
  tipo: MidiaTipo;
  veiculo: string;
  autor: string;
  titulo: string;
  descricao: string;
  url: string;
  linksExtras: LinkExtra[];
  thumbUrl: string;
  thumbPos: string;
  avatarUrl: string;
  logoKey: string; // "" | rótulo de LOGOS_PRESET
  publicado: boolean;
};

function logoDaKey(key: string) {
  return LOGOS_PRESET.find((l) => l.label === key) ?? null;
}

function keyDoLogo(url: string | null): string {
  if (!url) return "";
  return LOGOS_PRESET.find((l) => l.url === url)?.label ?? "";
}

function vazio(): FormState {
  return {
    tipo: "Coluna",
    veiculo: "",
    autor: "",
    titulo: "",
    descricao: "",
    url: "",
    linksExtras: [],
    thumbUrl: "",
    thumbPos: "",
    avatarUrl: "",
    logoKey: "",
    publicado: true,
  };
}

function deRow(r: MidiaRow): FormState {
  return {
    id: r.id,
    tipo: r.tipo,
    veiculo: r.veiculo,
    autor: r.autor,
    titulo: r.titulo,
    descricao: r.descricao,
    url: r.url,
    linksExtras: r.linksExtras,
    thumbUrl: r.thumbUrl ?? "",
    thumbPos: r.thumbPos ?? "",
    avatarUrl: r.avatarUrl ?? "",
    logoKey: keyDoLogo(r.logoVeiculo),
    publicado: r.publicado,
  };
}

async function enviarImagem(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/adm/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Falha no upload da imagem.");
  return data.url as string;
}

export function NaMidiaEditor({ itens }: { itens: MidiaRow[] }) {
  const router = useRouter();
  const [lista, setLista] = useState<MidiaRow[]>(itens);
  const [form, setForm] = useState<FormState | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);

  // Ressincroniza com o servidor após cada router.refresh().
  useEffect(() => {
    setLista(itens);
  }, [itens]);

  const abrirNovo = useCallback(() => setForm(vazio()), []);
  const abrirEdicao = useCallback((r: MidiaRow) => setForm(deRow(r)), []);

  async function togglePublicado(r: MidiaRow) {
    setOcupado(r.id);
    setLista((l) =>
      l.map((x) => (x.id === r.id ? { ...x, publicado: !x.publicado } : x)),
    );
    try {
      const res = await fetch("/api/adm/na-midia", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: r.id, publicado: !r.publicado }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setLista(itens); // desfaz otimismo
      alert("Não foi possível alterar a publicação.");
    } finally {
      setOcupado(null);
    }
  }

  async function excluir(r: MidiaRow) {
    if (!confirm(`Excluir "${r.titulo}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    setOcupado(r.id);
    try {
      const res = await fetch("/api/adm/na-midia", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: r.id }),
      });
      if (!res.ok) throw new Error();
      setLista((l) => l.filter((x) => x.id !== r.id));
      router.refresh();
    } catch {
      alert("Não foi possível excluir o card.");
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
      const res = await fetch("/api/adm/na-midia/ordem", {
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
          {lista.length} {lista.length === 1 ? "card" : "cards"}
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
          + Novo card
        </button>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-xl border border-line bg-white p-10 text-center text-muted">
          Nenhum card ainda. Clique em <strong>Novo card</strong> para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {lista.map((r, i) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-3 sm:flex-nowrap"
            >
              {/* Reordenação */}
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

              {/* Thumb */}
              {r.thumbUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.thumbUrl}
                  alt=""
                  className="h-12 w-20 shrink-0 rounded-md border border-line object-cover"
                  style={{ objectPosition: r.thumbPos ?? "center" }}
                />
              ) : (
                <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-line bg-surface-soft text-[10px] text-muted">
                  sem thumb
                </span>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    {r.tipo}
                  </span>
                  {r.publicado ? (
                    <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                      Publicado
                    </span>
                  ) : (
                    <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs font-semibold text-muted">
                      Rascunho
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-semibold text-brand-blue">
                  {r.titulo}
                </p>
                <p className="truncate text-xs text-muted">
                  {r.autor} · {r.veiculo}
                </p>
              </div>

              {/* Ações */}
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
        <FormularioMidia
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

function FormularioMidia({
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
  const [thumbBusy, setThumbBusy] = useState(false);
  const [thumbErro, setThumbErro] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const thumbInput = useRef<HTMLInputElement>(null);
  const avatarInput = useRef<HTMLInputElement>(null);

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

  const preview: MidiaCard = useMemo(() => {
    const logo = logoDaKey(form.logoKey);
    return {
      id: "preview",
      tipo: form.tipo,
      veiculo: form.veiculo || "Veículo",
      autor: form.autor || "Autor",
      titulo: form.titulo || "Título do conteúdo",
      descricao: form.descricao,
      url: form.url || "#",
      linksExtras: form.linksExtras.filter((l) => l.label && l.url),
      thumb: form.thumbUrl || null,
      thumbPos: form.thumbPos || null,
      avatar: form.avatarUrl || null,
      logoVeiculo: logo?.url ?? null,
      logoAlt: logo?.label ?? null,
      logoClasse: logo?.classe ?? null,
    };
  }, [form]);

  async function subirThumb(file: File) {
    setThumbBusy(true);
    setThumbErro(null);
    try {
      const url = await enviarImagem(file);
      set("thumbUrl", url);
    } catch (e) {
      setThumbErro(e instanceof Error ? e.message : "Falha no upload.");
    } finally {
      setThumbBusy(false);
    }
  }

  async function buscarOg() {
    if (!/^https?:\/\//i.test(form.url)) {
      setThumbErro("Preencha o link principal (http/https) primeiro.");
      return;
    }
    setThumbBusy(true);
    setThumbErro(null);
    try {
      const res = await fetch(
        `/api/adm/na-midia/ogimage?url=${encodeURIComponent(form.url)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Não foi possível buscar.");
      set("thumbUrl", data.url);
    } catch (e) {
      setThumbErro(e instanceof Error ? e.message : "Falha ao buscar imagem.");
    } finally {
      setThumbBusy(false);
    }
  }

  async function subirAvatar(file: File) {
    setAvatarBusy(true);
    try {
      const url = await enviarImagem(file);
      set("avatarUrl", url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Falha no upload do avatar.");
    } finally {
      setAvatarBusy(false);
    }
  }

  function addLink() {
    if (form.linksExtras.length >= 6) return;
    setForm({ ...form, linksExtras: [...form.linksExtras, { label: "", url: "" }] });
  }
  function setLink(i: number, campo: keyof LinkExtra, v: string) {
    const nova = form.linksExtras.map((l, idx) =>
      idx === i ? { ...l, [campo]: v } : l,
    );
    setForm({ ...form, linksExtras: nova });
  }
  function removerLink(i: number) {
    setForm({
      ...form,
      linksExtras: form.linksExtras.filter((_, idx) => idx !== i),
    });
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const logo = logoDaKey(form.logoKey);
    const payload = {
      id: form.id,
      tipo: form.tipo,
      veiculo: form.veiculo.trim(),
      autor: form.autor.trim(),
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      url: form.url.trim(),
      linksExtras: form.linksExtras
        .map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
        .filter((l) => l.label && l.url),
      thumbUrl: form.thumbUrl || null,
      thumbPos: form.thumbPos.trim() || null,
      avatarUrl: form.avatarUrl || null,
      logoVeiculo: logo?.url ?? null,
      logoAlt: logo?.label ?? null,
      logoClasse: logo?.classe ?? null,
      publicado: form.publicado,
    };
    try {
      const res = await fetch("/api/adm/na-midia", {
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
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 pb-3 text-white">
          <h2 className="font-display text-lg font-bold">
            {form.id ? "Editar card" : "Novo card"} · Na Mídia
          </h2>
          <button
            type="button"
            onClick={onFechar}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Fechar ✕
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto rounded-2xl bg-white p-4 lg:grid-cols-[1fr_380px]">
          {/* FORM */}
          <div className="min-w-0 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Tipo">
                <select
                  value={form.tipo}
                  onChange={(e) => set("tipo", e.target.value as MidiaTipo)}
                  className="hce-input"
                >
                  {MIDIA_TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Veículo">
                <input
                  value={form.veiculo}
                  onChange={(e) => set("veiculo", e.target.value)}
                  placeholder="Ex.: Extra · O Globo"
                  className="hce-input"
                  maxLength={120}
                />
              </Campo>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Autor">
                <input
                  value={form.autor}
                  onChange={(e) => set("autor", e.target.value)}
                  placeholder="Ex.: Cris Leite"
                  className="hce-input"
                  maxLength={120}
                />
              </Campo>
              <Campo label="Link principal (URL)">
                <input
                  value={form.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://…"
                  className="hce-input"
                  inputMode="url"
                  maxLength={600}
                />
              </Campo>
            </div>

            <Campo label="Título">
              <input
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                placeholder="Título do conteúdo"
                className="hce-input"
                maxLength={180}
              />
            </Campo>

            <Campo label="Descrição (texto de apoio)">
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Uma linha ou duas sobre o conteúdo."
                className="hce-input min-h-20 resize-y"
                maxLength={600}
              />
              <span className="mt-1 block text-right text-xs text-muted">
                {form.descricao.length}/600
              </span>
            </Campo>

            {/* THUMBNAIL */}
            <Grupo titulo="Thumbnail">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => thumbInput.current?.click()}
                  disabled={thumbBusy}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                >
                  {thumbBusy ? "Enviando…" : "Enviar imagem"}
                </button>
                <button
                  type="button"
                  onClick={buscarOg}
                  disabled={thumbBusy}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                >
                  Buscar do link (og:image)
                </button>
                {form.thumbUrl && (
                  <button
                    type="button"
                    onClick={() => set("thumbUrl", "")}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
                <input
                  ref={thumbInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirThumb(f);
                    e.target.value = "";
                  }}
                />
              </div>
              {thumbErro && (
                <p className="text-xs text-red-600">{thumbErro}</p>
              )}
              <Campo label="Posição do recorte (object-position)">
                <input
                  value={form.thumbPos}
                  onChange={(e) => set("thumbPos", e.target.value)}
                  placeholder='Ex.: "center 22%" (opcional)'
                  className="hce-input"
                  maxLength={40}
                />
              </Campo>
            </Grupo>

            {/* AVATAR */}
            <Grupo titulo="Avatar do autor">
              <div className="flex flex-wrap items-center gap-2">
                {AVATARES_PRESET.map((a) => (
                  <button
                    key={a.url}
                    type="button"
                    onClick={() => set("avatarUrl", a.url)}
                    className={
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
                      (form.avatarUrl === a.url
                        ? "border-brand-blue bg-brand-blue text-white"
                        : "border-line text-brand-blue hover:bg-surface-soft")
                    }
                  >
                    {a.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => avatarInput.current?.click()}
                  disabled={avatarBusy}
                  className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                >
                  {avatarBusy ? "Enviando…" : "Enviar…"}
                </button>
                {form.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => set("avatarUrl", "")}
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                )}
                <input
                  ref={avatarInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirAvatar(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </Grupo>

            {/* LOGO DO VEÍCULO */}
            <Campo label="Selo do veículo (logo)">
              <select
                value={form.logoKey}
                onChange={(e) => set("logoKey", e.target.value)}
                className="hce-input"
              >
                <option value="">Nenhum</option>
                {LOGOS_PRESET.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Campo>

            {/* LINKS EXTRAS */}
            <Grupo titulo="Links extras (chips no rodapé)">
              {form.linksExtras.length === 0 && (
                <p className="text-xs text-muted">Nenhum link extra.</p>
              )}
              {form.linksExtras.map((l, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input
                    value={l.label}
                    onChange={(e) => setLink(i, "label", e.target.value)}
                    placeholder="Rótulo (ex.: Linktree)"
                    className="hce-input flex-1"
                    maxLength={40}
                  />
                  <input
                    value={l.url}
                    onChange={(e) => setLink(i, "url", e.target.value)}
                    placeholder="https://…"
                    className="hce-input flex-[2]"
                    maxLength={600}
                  />
                  <button
                    type="button"
                    onClick={() => removerLink(i)}
                    className="rounded-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    aria-label="Remover link"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.linksExtras.length < 6 && (
                <button
                  type="button"
                  onClick={addLink}
                  className="text-xs font-semibold text-brand-blue hover:underline"
                >
                  + Adicionar link
                </button>
              )}
            </Grupo>

            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.publicado}
                onChange={(e) => set("publicado", e.target.checked)}
                className="h-4 w-4 rounded border-line accent-brand-blue"
              />
              Publicado (visível em /na-midia)
            </label>

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
              <CardMidia item={preview} />
            </div>
          </aside>
        </div>

        {/* AÇÕES */}
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
            {salvando ? "Salvando…" : form.id ? "Salvar alterações" : "Criar card"}
          </button>
        </div>
      </div>
    </div>
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
