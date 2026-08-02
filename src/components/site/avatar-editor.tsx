"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const MAX_DIM = 512;
const JPEG_Q = 0.85;

// Decodifica a imagem de forma robusta: tenta createImageBitmap (rapido) e,
// se falhar (ex.: HEIC do iPhone em alguns navegadores), cai para <img>.
async function decodificar(
  file: File,
): Promise<{ w: number; h: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }> {
  try {
    const bmp = await createImageBitmap(file);
    return {
      w: bmp.width,
      h: bmp.height,
      draw: (ctx, w, h) => {
        ctx.drawImage(bmp, 0, 0, w, h);
        bmp.close?.();
      },
    };
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new window.Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("decode"));
        el.src = url;
      });
      return {
        w: img.naturalWidth,
        h: img.naturalHeight,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
      };
    } finally {
      // revoga depois do desenho (no microtask); seguro deixar aqui.
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  }
}

async function reduzirImagem(file: File): Promise<Blob> {
  const src = await decodificar(file);
  if (!src.w || !src.h) throw new Error("dimensoes");
  const escala = Math.min(1, MAX_DIM / Math.max(src.w, src.h));
  const w = Math.max(1, Math.round(src.w * escala));
  const h = Math.max(1, Math.round(src.h * escala));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  src.draw(ctx, w, h);
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
  endpoint = "/api/conta/avatar",
}: {
  initialImage: string | null;
  nome: string | null;
  size?: number;
  endpoint?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [avatar, setAvatar] = useState<string | null>(initialImage);
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [modo, setModo] = useState<"menu" | "camera">("menu");
  const [contagem, setContagem] = useState<number | null>(null);

  function pararCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function fechar() {
    pararCamera();
    setModo("menu");
    setContagem(null);
    setAberto(false);
  }

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  // Ao desmontar, garante que a câmera seja liberada.
  useEffect(() => () => pararCamera(), []);

  // Conecta o stream ao <video> quando entra no modo câmera.
  useEffect(() => {
    if (modo === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [modo]);

  async function enviarBlob(blob: Blob) {
    const fd = new FormData();
    fd.append("file", blob, "avatar.jpg");
    const res = await fetch(endpoint, { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Falha ao enviar a foto.");
    setAvatar(`${data.url}?t=${Date.now()}`);
    router.refresh();
  }

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
      await enviarBlob(reduzida);
    } catch (err) {
      setErro(
        err instanceof Error && err.message.includes("Falha")
          ? err.message
          : "Não conseguimos ler essa imagem. Tente outra foto (JPG ou PNG) ou tire um print.",
      );
    } finally {
      setOcupado(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function abrirCamera() {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setModo("camera");
    } catch {
      setErro(
        "Não conseguimos acessar a câmera. Verifique a permissão do navegador e tente de novo.",
      );
    }
  }

  async function capturar() {
    const video = videoRef.current;
    if (!video || ocupado) return;
    setErro(null);
    // Contagem regressiva 3, 2, 1 sobre a tela.
    for (let n = 3; n >= 1; n--) {
      setContagem(n);
      await new Promise((r) => setTimeout(r, 800));
    }
    setContagem(null);

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) {
      setErro("A câmera ainda não está pronta. Tente de novo.");
      return;
    }
    const escala = Math.min(1, MAX_DIM / Math.max(vw, vh));
    const w = Math.max(1, Math.round(vw * escala));
    const h = Math.max(1, Math.round(vh * escala));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setErro("Não foi possível capturar a foto.");
      return;
    }
    // Espelha para bater com a prévia (efeito selfie).
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);

    setOcupado(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("blob"))),
          "image/jpeg",
          JPEG_Q,
        );
      });
      await enviarBlob(blob);
      pararCamera();
      setModo("menu");
    } catch (err) {
      setErro(
        err instanceof Error && err.message.includes("Falha")
          ? err.message
          : "Falha ao enviar a foto.",
      );
    } finally {
      setOcupado(false);
    }
  }

  async function remover() {
    setErro(null);
    setOcupado(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
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
          onClick={fechar}
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
                onClick={fechar}
                aria-label="Fechar"
                className="rounded-full p-1 text-2xl leading-none text-muted hover:bg-surface-soft hover:text-brand-blue"
              >
                ×
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={escolher}
              className="hidden"
            />

            {modo === "menu" ? (
              <>
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
                    {ocupado
                      ? "Processando…"
                      : avatar
                        ? "Trocar foto"
                        : "Enviar foto"}
                  </button>
                  <button
                    type="button"
                    onClick={abrirCamera}
                    disabled={ocupado}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    Tirar foto agora
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
                  Pode enviar a foto direto do celular ou tirar uma na hora — nós
                  ajustamos o tamanho automaticamente para carregar rápido.
                </p>
              </>
            ) : (
              <>
                <div className="relative mx-auto mt-5 aspect-square w-full overflow-hidden rounded-2xl border border-line bg-brand-blue-deep">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="h-full w-full -scale-x-100 object-cover"
                  />
                  {contagem !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-blue-deep/40">
                      <span
                        key={contagem}
                        className="hce-contagem font-display text-8xl font-extrabold text-white drop-shadow-lg"
                      >
                        {contagem}
                      </span>
                    </div>
                  )}
                </div>

                {erro && (
                  <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
                    {erro}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={capturar}
                    disabled={ocupado || contagem !== null}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-5 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
                  >
                    {ocupado
                      ? "Enviando…"
                      : contagem !== null
                        ? "Prepare-se…"
                        : "Capturar foto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      pararCamera();
                      setModo("menu");
                      setContagem(null);
                    }}
                    disabled={ocupado || contagem !== null}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
                  >
                    Voltar
                  </button>
                </div>
                <p className="mt-4 text-xs text-muted">
                  Enquadre o rosto e toque em “Capturar foto”. Vamos contar 3, 2,
                  1 antes de registrar.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
