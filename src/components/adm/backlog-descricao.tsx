"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

// Editor simples de descrição (contentEditable) que aceita colar imagens
// direto pelo Ctrl+V: cada imagem é enviada para /api/adm/upload e embutida
// como <img src="/api/img/{id}"> no ponto do cursor. Texto colado segue normal.
// O conteúdo (innerHTML) é lido pelo componente pai através do ref.

type Props = {
  defaultHtml?: string;
  placeholder?: string;
  onErro?: (m: string | null) => void;
};

export const BacklogDescricao = forwardRef<HTMLDivElement, Props>(
  function BacklogDescricao({ defaultHtml = "", placeholder, onErro }, ref) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const [enviando, setEnviando] = useState(false);

    function setRefs(el: HTMLDivElement | null) {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }

    // Conteúdo inicial só na montagem (contentEditable é não controlado).
    useEffect(() => {
      if (innerRef.current) innerRef.current.innerHTML = defaultHtml;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function uploadImagem(file: File): Promise<string | null> {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/adm/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        onErro?.(d.error || "Falha ao enviar a imagem.");
        return null;
      }
      const d = (await res.json()) as { url: string };
      return d.url;
    }

    function inserirNode(node: Node, range: Range | null) {
      const el = innerRef.current;
      if (!el) return;
      if (range && el.contains(range.commonAncestorContainer)) {
        range.collapse(false);
        range.insertNode(node);
        range.setStartAfter(node);
        range.setEndAfter(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } else {
        el.appendChild(node);
      }
    }

    async function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
      const items = Array.from(e.clipboardData?.items || []);
      const imagens = items.filter(
        (it) => it.kind === "file" && it.type.startsWith("image/"),
      );
      if (imagens.length === 0) return; // colagem de texto: comportamento padrão
      e.preventDefault();
      onErro?.(null);

      const sel = window.getSelection();
      const range =
        sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;

      setEnviando(true);
      try {
        for (const it of imagens) {
          const file = it.getAsFile();
          if (!file) continue;
          const url = await uploadImagem(file);
          if (!url) continue;
          const img = document.createElement("img");
          img.src = url;
          img.alt = "";
          inserirNode(img, range);
        }
      } finally {
        setEnviando(false);
      }
    }

    return (
      <div>
        <div
          ref={setRefs}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onPaste={onPaste}
          data-placeholder={placeholder}
          className="hce-descricao max-h-[420px] min-h-[140px] w-full overflow-y-auto rounded-xl border border-line bg-white p-3 text-sm leading-relaxed text-ink focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(0,50,136,0.12)] focus:outline-none [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg"
        />
        <p className="mt-1 text-xs text-muted">
          {enviando
            ? "Enviando imagem…"
            : "Dica: cole imagens direto com Ctrl+V (ou Cmd+V)."}
        </p>
      </div>
    );
  },
);
