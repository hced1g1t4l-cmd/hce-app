"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { slugify, dataLonga } from "@/lib/feed";
import { cn } from "@/lib/cn";
import { Container } from "@/components/site/container";

export type ArtigoInit = {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  capaUrl: string | null;
  autor: string;
  conteudoHtml: string;
  publicado: boolean;
};

const TAMANHOS = [
  { label: "Normal", valor: "" },
  { label: "Pequeno", valor: "14px" },
  { label: "Médio", valor: "20px" },
  { label: "Grande", valor: "24px" },
  { label: "Enorme", valor: "30px" },
];

const CORES = [
  { nome: "Azul HCE", cor: "#003288" },
  { nome: "Âmbar HCE", cor: "#e8a200" },
  { nome: "Tinta", cor: "#131720" },
  { nome: "Cinza", cor: "#5a6473" },
  { nome: "Vinho", cor: "#7a1f2b" },
  { nome: "Verde", cor: "#1f7a4d" },
];

export function ArtigoEditor({ initial }: { initial?: ArtigoInit }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTocado, setSlugTocado] = useState(Boolean(initial?.slug));
  const [resumo, setResumo] = useState(initial?.resumo ?? "");
  const [autor, setAutor] = useState(initial?.autor ?? "");
  const [capaUrl, setCapaUrl] = useState(initial?.capaUrl ?? "");
  const [publicado, setPublicado] = useState(initial?.publicado ?? false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");

  const capaInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ HTMLAttributes: { class: "materia-img" } }),
      Placeholder.configure({ placeholder: "Escreva a matéria aqui…" }),
    ],
    content: initial?.conteudoHtml ?? "",
    editorProps: {
      attributes: {
        class: "materia hce-editor-content focus:outline-none",
      },
    },
  });

  function onTitulo(v: string) {
    setTitulo(v);
    if (!slugTocado) setSlug(slugify(v));
  }

  async function uploadImagem(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/adm/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setErro(d.error || "Falha ao enviar a imagem.");
      return null;
    }
    const d = (await res.json()) as { url: string };
    return d.url;
  }

  async function onCapaSelecionada(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro(null);
    setEnviandoCapa(true);
    const url = await uploadImagem(file);
    setEnviandoCapa(false);
    if (url) setCapaUrl(url);
  }

  async function salvar(publicarAgora?: boolean) {
    if (!editor) return;
    setErro(null);
    if (!titulo.trim()) {
      setErro("Dê um título à matéria.");
      return;
    }
    if (!autor.trim()) {
      setErro("Informe quem redigiu a matéria.");
      return;
    }
    const querPublicar = publicarAgora ?? publicado;
    const payload = {
      id: initial?.id,
      titulo: titulo.trim(),
      slug: slug.trim() || undefined,
      resumo: resumo.trim() || null,
      capaUrl: capaUrl.trim() || null,
      autor: autor.trim(),
      conteudoHtml: editor.getHTML(),
      publicado: querPublicar,
    };
    setSalvando(true);
    try {
      const res = await fetch("/api/adm/artigos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setErro(d.error || "Não foi possível salvar.");
        setSalvando(false);
        return;
      }
      router.push("/adm/feed");
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setSalvando(false);
    }
  }

  function abrirPreview() {
    setErro(null);
    setPreviewHtml(editor?.getHTML() ?? "");
    setPreview(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      {preview && (
        <ArtigoPreview
          titulo={titulo}
          resumo={resumo}
          autor={autor}
          capaUrl={capaUrl}
          html={previewHtml}
          onFechar={() => setPreview(false)}
        />
      )}
      {/* COLUNA PRINCIPAL — conteúdo */}
      <div className="min-w-0">
        <label className="block">
          <span className="text-sm font-semibold text-brand-blue">Título</span>
          <input
            value={titulo}
            onChange={(e) => onTitulo(e.target.value)}
            placeholder="Título da matéria"
            className="hce-input mt-1.5 font-display text-lg font-bold"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-brand-blue">
            Resumo / linha fina{" "}
            <span className="font-normal text-muted">(opcional)</span>
          </span>
          <textarea
            value={resumo}
            onChange={(e) => setResumo(e.target.value)}
            rows={2}
            placeholder="Uma frase que resume a matéria (aparece na listagem e no topo)."
            className="hce-input mt-1.5 resize-y"
          />
        </label>

        <div className="mt-6">
          <span className="text-sm font-semibold text-brand-blue">Conteúdo</span>
          <div className="mt-1.5 overflow-hidden rounded-xl border border-line bg-white">
            {editor && <EditorToolbar editor={editor} onUpload={uploadImagem} onErro={setErro} />}
            <EditorContent editor={editor} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Dica: selecione o texto para aplicar cor, tamanho, alinhamento ou
            link. Use o botão de imagem para inserir fotos no meio da matéria.
          </p>
        </div>
      </div>

      {/* COLUNA LATERAL — publicação */}
      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            Publicação
          </h2>

          <label className="mt-4 flex items-start gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={publicado}
              onChange={(e) => setPublicado(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 rounded border-line accent-brand-blue"
            />
            <span className="leading-snug">
              Publicar no site (visível em <strong>/feed</strong>). Desmarcado =
              rascunho.
            </span>
          </label>

          {erro && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {erro}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => salvar()}
              disabled={salvando}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-5 py-2.5 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {salvando ? "Salvando…" : "Salvar"}
            </button>
            {!publicado && (
              <button
                type="button"
                onClick={() => salvar(true)}
                disabled={salvando}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-5 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
              >
                Salvar e publicar
              </button>
            )}
            <button
              type="button"
              onClick={abrirPreview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brand-blue px-5 py-2.5 font-display text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Ver preview
            </button>
            <p className="text-center text-xs text-muted">
              Veja como a matéria ficará no Feed HCE antes de publicar.
            </p>
            <button
              type="button"
              onClick={() => router.push("/adm/feed")}
              className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-soft"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            Imagem de capa
          </h2>
          {capaUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capaUrl}
              alt="Capa da matéria"
              className="mt-3 aspect-video w-full rounded-lg border border-line object-cover"
            />
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-line bg-surface-soft px-3 py-6 text-center text-sm text-muted">
              Nenhuma capa selecionada.
            </p>
          )}
          <input
            ref={capaInputRef}
            type="file"
            accept="image/*"
            onChange={onCapaSelecionada}
            className="hidden"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => capaInputRef.current?.click()}
              disabled={enviandoCapa}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
            >
              {enviandoCapa ? "Enviando…" : capaUrl ? "Trocar capa" : "Enviar capa"}
            </button>
            {capaUrl && (
              <button
                type="button"
                onClick={() => setCapaUrl("")}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface-soft"
              >
                Remover
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
            Autoria e link
          </h2>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-brand-blue">
              Redigido por
            </span>
            <input
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              placeholder="Ex.: Cris Leite"
              className="hce-input mt-1.5"
            />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-semibold text-brand-blue">
              Endereço (slug)
            </span>
            <input
              value={slug}
              onChange={(e) => {
                setSlugTocado(true);
                setSlug(e.target.value);
              }}
              placeholder="endereco-da-materia"
              className="hce-input mt-1.5 font-mono text-sm"
            />
            <span className="mt-1 block text-xs text-muted break-all">
              /feed/{slug || "..."}
            </span>
          </label>
        </div>
      </aside>
    </div>
  );
}

// Preview fiel de como a matéria abre no Feed HCE (mesmo layout de
// /feed/[slug]). Sobreposicao com botao para voltar ao editor.
function ArtigoPreview({
  titulo,
  resumo,
  autor,
  capaUrl,
  html,
  onFechar,
}: {
  titulo: string;
  resumo: string;
  autor: string;
  capaUrl: string;
  html: string;
  onFechar: () => void;
}) {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
      {/* Barra do preview (fica fixa no topo) */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={onFechar}
          className="inline-flex items-center gap-2 rounded-full bg-brand-blue px-4 py-2 font-display text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
        >
          <span aria-hidden>←</span> Voltar ao editor
        </button>
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase sm:text-sm">
          <span className="hidden h-2 w-2 rounded-full bg-brand-amber sm:inline-block" />
          Pré-visualização — assim ficará no Feed HCE
        </span>
      </div>

      {/* Réplica do artigo publicado */}
      <article className="bg-white pb-20">
        <header className="bg-gradient-to-b from-brand-blue to-brand-blue-deep py-14 text-white sm:py-16">
          <Container className="max-w-3xl">
            <span className="text-sm font-semibold text-brand-amber">
              ← Feed HCE
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-balance sm:text-4xl">
              {titulo.trim() || "Título da matéria"}
            </h1>
            {resumo.trim() && (
              <p className="mt-4 text-lg leading-relaxed text-white/80">
                {resumo}
              </p>
            )}
            <p className="mt-6 text-sm text-white/70">
              Redigido por{" "}
              <span className="font-semibold text-white">
                {autor.trim() || "Autor"}
              </span>{" "}
              · Última atualização em {dataLonga(new Date())}
            </p>
          </Container>
        </header>

        {capaUrl && (
          <Container className="max-w-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capaUrl}
              alt={titulo}
              className="-mt-8 aspect-video w-full rounded-2xl border border-line object-cover shadow-lg sm:-mt-10"
            />
          </Container>
        )}

        <Container className="max-w-3xl">
          {html.replace(/<[^>]*>/g, "").trim() ? (
            <div
              className="materia mt-10"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <p className="mt-10 rounded-xl border border-dashed border-line bg-surface-soft px-4 py-10 text-center text-muted">
              A matéria ainda está vazia. Escreva o conteúdo no editor para
              visualizar aqui.
            </p>
          )}
        </Container>
      </article>

      {/* CTA final (igual ao site) */}
      <section className="bg-surface-soft py-16">
        <Container className="max-w-3xl text-center">
          <h2 className="font-display text-2xl font-bold text-brand-blue">
            Gostou do conteúdo?
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-muted">
            O +HCE reúne receitas, fichas técnicas, e-books e comunidade para
            quem quer ir além.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-amber px-6 font-display text-base font-semibold text-brand-blue-deep">
              Conhecer o +HCE
            </span>
            <span className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-blue px-6 font-display text-base font-semibold text-white">
              Ver mais artigos
            </span>
          </div>
        </Container>
      </section>

      <div className="flex justify-center border-t border-line bg-white py-8">
        <button
          type="button"
          onClick={onFechar}
          className="inline-flex items-center gap-2 rounded-full border border-brand-blue px-6 py-2.5 font-display text-sm font-semibold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
        >
          <span aria-hidden>←</span> Voltar ao editor
        </button>
      </div>
    </div>
  );
}

function EditorToolbar({
  editor,
  onUpload,
  onErro,
}: {
  editor: Editor;
  onUpload: (f: File) => Promise<string | null>;
  onErro: (m: string | null) => void;
}) {
  const imgInputRef = useRef<HTMLInputElement>(null);

  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      bold: ctx.editor.isActive("bold"),
      italic: ctx.editor.isActive("italic"),
      underline: ctx.editor.isActive("underline"),
      strike: ctx.editor.isActive("strike"),
      h2: ctx.editor.isActive("heading", { level: 2 }),
      h3: ctx.editor.isActive("heading", { level: 3 }),
      bullet: ctx.editor.isActive("bulletList"),
      ordered: ctx.editor.isActive("orderedList"),
      quote: ctx.editor.isActive("blockquote"),
      link: ctx.editor.isActive("link"),
      alignLeft: ctx.editor.isActive({ textAlign: "left" }),
      alignCenter: ctx.editor.isActive({ textAlign: "center" }),
      alignRight: ctx.editor.isActive({ textAlign: "right" }),
      alignJustify: ctx.editor.isActive({ textAlign: "justify" }),
      fontSize: (ctx.editor.getAttributes("textStyle").fontSize as string) || "",
    }),
  });

  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (URL):", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  async function onImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onErro(null);
    const url = await onUpload(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line bg-surface-soft p-2">
      <TBtn active={s.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        Título
      </TBtn>
      <TBtn active={s.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        Subtítulo
      </TBtn>

      <Sep />

      <TBtn active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold">B</span>
      </TBtn>
      <TBtn active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic">I</span>
      </TBtn>
      <TBtn active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </TBtn>
      <TBtn active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </TBtn>

      <Sep />

      {/* Tamanho da fonte */}
      <select
        value={s.fontSize}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") editor.chain().focus().unsetFontSize().run();
          else editor.chain().focus().setFontSize(v).run();
        }}
        aria-label="Tamanho da fonte"
        className="h-8 rounded-md border border-line bg-white px-2 text-sm text-brand-blue"
      >
        {TAMANHOS.map((t) => (
          <option key={t.label} value={t.valor}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Cores */}
      <div className="flex items-center gap-1">
        {CORES.map((c) => (
          <button
            key={c.cor}
            type="button"
            title={c.nome}
            aria-label={`Cor ${c.nome}`}
            onClick={() => editor.chain().focus().setColor(c.cor).run()}
            className="h-6 w-6 rounded-full border border-line"
            style={{ backgroundColor: c.cor }}
          />
        ))}
        <label
          title="Cor personalizada"
          className="flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line"
        >
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Escolher cor personalizada"
          />
        </label>
        <TBtn onClick={() => editor.chain().focus().unsetColor().run()}>
          <span className="text-xs">Cor✕</span>
        </TBtn>
      </div>

      <Sep />

      {/* Alinhamento */}
      <TBtn active={s.alignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignIcon variant="left" />
      </TBtn>
      <TBtn active={s.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignIcon variant="center" />
      </TBtn>
      <TBtn active={s.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignIcon variant="right" />
      </TBtn>
      <TBtn active={s.alignJustify} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignIcon variant="justify" />
      </TBtn>

      <Sep />

      <TBtn active={s.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        Lista
      </TBtn>
      <TBtn active={s.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        Lista nº
      </TBtn>
      <TBtn active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Citação
      </TBtn>

      <Sep />

      <TBtn active={s.link} onClick={setLink}>
        Link
      </TBtn>
      <TBtn onClick={() => imgInputRef.current?.click()}>Imagem</TBtn>
      <input
        ref={imgInputRef}
        type="file"
        accept="image/*"
        onChange={onImagem}
        className="hidden"
      />

      <Sep />

      <TBtn onClick={() => editor.chain().focus().undo().run()}>Desfazer</TBtn>
      <TBtn onClick={() => editor.chain().focus().redo().run()}>Refazer</TBtn>
    </div>
  );
}

function TBtn({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors",
        active
          ? "bg-brand-blue text-white"
          : "text-brand-blue hover:bg-white",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-6 w-px bg-line" aria-hidden />;
}

function AlignIcon({
  variant,
}: {
  variant: "left" | "center" | "right" | "justify";
}) {
  const lines: Record<string, number[]> = {
    left: [16, 10, 14, 8],
    center: [16, 12, 16, 12],
    right: [16, 10, 16, 12],
    justify: [16, 16, 16, 16],
  };
  const w = lines[variant];
  const x = (i: number) =>
    variant === "center"
      ? (16 - w[i]) / 2 + 2
      : variant === "right"
        ? 18 - w[i]
        : 2;
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden fill="none">
      {w.map((len, i) => (
        <rect
          key={i}
          x={x(i)}
          y={3 + i * 4}
          width={len}
          height="2"
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
