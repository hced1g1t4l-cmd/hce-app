"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MAX_DIM = 512;
const JPEG_Q = 0.85;

async function reduzirImagem(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * escala);
  const h = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("blob"))),
      "image/jpeg",
      JPEG_Q,
    );
  });
}

function iniciais(nome: string | null): string {
  if (!nome) return "+";
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

export function AvatarEditor({
  initialImage,
  nome,
  size = 88,
}: {
  initialImage: string | null;
  nome: string | null;
  size?: number;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(initialImage);
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    if (!file.type.startsWith("image/")) {
      setErro("Selecione uma imagem.");
      return;
    }
    setOcupado(true);
    try {
      const reduzida = await reduzirImagem(file);
      const fd = new FormData();
      fd.append("file", reduzida, "avatar.jpg");
      const res = await fetch("/api/conta/avatar", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || "Falha ao enviar a foto.");
        return;
      }
      setAvatar(`${data.url}?t=${Date.now()}`);
      router.refresh();
    } catch {
      setErro("Não foi possível processar a imagem.");
    } finally {
      setOcupado(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remover() {
    setErro(null);
    setOcupado(true);
    try {
      const res = await fetch("/api/conta/avatar", { method: "DELETE" });
      if (!res.ok) {
        setErro("Falha ao remover a foto.");
        return;
      }
      setAvatar(null);
      router.refresh();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Atualizar foto de perfil"
        className="group relative shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        style={{ width: size, height: size }}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt="Sua foto de perfil"
            fill
            sizes={`${size}px`}
            className="object-cover"
            unoptimized
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-surface-soft font-display font-bold text-brand-blue/40"
            style={{ fontSize: size * 0.34 }}
          >
            {iniciais(nome)}
          </span>
        )}
        {/* Overlay com "+" no hover/foco */}
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-brand-blue/55 text-3xl font-bold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          +
        </span>
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Atualizar foto de perfil"
          onClick={() => setAberto(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue-deep/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-lg font-bold text-brand-blue">
                Foto de perfil
              </h2>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="rounded-full p-1 text-2xl leading-none text-muted hover:bg-surface-soft hover:text-brand-blue"
              >
                ×
              </button>
            </div>

            <div className="relative mx-auto mt-5 h-32 w-32 overflow-hidden rounded-full border border-line bg-surface-soft">
              {avatar ? (
                <Image
                  src={avatar}
                  alt="Prévia"
                  fill
                  sizes="128px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span
                  aria-hidden
                  className="flex h-full w-full items-center justify-center font-display text-4xl font-bold text-brand-blue/40"
                >
                  {iniciais(nome)}
                </span>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={escolher}
              className="hidden"
            />

            {erro && (
              <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                {erro}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={ocupado}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-5 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
              >
                {ocupado ? "Processando…" : avatar ? "Trocar foto" : "Enviar foto"}
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={remover}
                  disabled={ocupado}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
                >
                  Remover foto
                </button>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">
              A imagem é reduzida automaticamente (até {MAX_DIM}px) para ficar
              leve.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
