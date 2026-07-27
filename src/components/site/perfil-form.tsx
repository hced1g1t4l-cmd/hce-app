"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type PerfilInit = {
  image: string | null;
  bio: string;
  telefone: string;
  endereco: string;
  linkedin: string;
  instagram: string;
  facebook: string;
};

const MAX_DIM = 512; // maior lado da foto de perfil, em px
const JPEG_Q = 0.85;

// Reduz a resolucao da foto no proprio navegador (canvas) para evitar upload pesado.
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

export function PerfilForm({ init }: { init: PerfilInit }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(init.image);
  const [subindoFoto, setSubindoFoto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [bio, setBio] = useState(init.bio);
  const [telefone, setTelefone] = useState(init.telefone);
  const [endereco, setEndereco] = useState(init.endereco);
  const [linkedin, setLinkedin] = useState(init.linkedin);
  const [instagram, setInstagram] = useState(init.instagram);
  const [facebook, setFacebook] = useState(init.facebook);

  async function escolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    setOk(null);
    if (!file.type.startsWith("image/")) {
      setErro("Selecione uma imagem.");
      return;
    }
    setSubindoFoto(true);
    try {
      const reduzida = await reduzirImagem(file);
      const fd = new FormData();
      fd.append("file", reduzida, "avatar.jpg");
      const res = await fetch("/api/conta/avatar", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(data.error || "Falha ao enviar a foto.");
        return;
      }
      setAvatar(`${data.url}?t=${Date.now()}`);
      setOk("Foto atualizada.");
      router.refresh();
    } catch {
      setErro("Não foi possível processar a imagem.");
    } finally {
      setSubindoFoto(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removerFoto() {
    setErro(null);
    setOk(null);
    setSubindoFoto(true);
    try {
      const res = await fetch("/api/conta/avatar", { method: "DELETE" });
      if (!res.ok) {
        setErro("Falha ao remover a foto.");
        return;
      }
      setAvatar(null);
      router.refresh();
    } finally {
      setSubindoFoto(false);
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
        body: JSON.stringify({
          bio,
          telefone,
          endereco,
          linkedin,
          instagram,
          facebook,
        }),
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

      {/* Foto de perfil */}
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-line bg-surface-soft">
          {avatar ? (
            <Image
              src={avatar}
              alt="Foto de perfil"
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span
              aria-hidden
              className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-brand-blue/40"
            >
              +
            </span>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={escolherFoto}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={subindoFoto}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {subindoFoto ? "Processando…" : avatar ? "Trocar foto" : "Enviar foto"}
            </button>
            {avatar && (
              <button
                type="button"
                onClick={removerFoto}
                disabled={subindoFoto}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-60"
              >
                Remover
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            A imagem é reduzida automaticamente (até {MAX_DIM}px) para ficar leve.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            Bio <span className="font-normal text-muted">(opcional)</span>
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="Conte um pouco sobre você e sua trajetória na gastronomia."
            className="hce-input mt-1.5 resize-y"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-display text-sm font-semibold text-brand-blue">
              Telefone
            </span>
            <input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              type="tel"
              autoComplete="tel"
              placeholder="(21) 90000-0000"
              className="hce-input mt-1.5"
            />
          </label>
          <label className="block">
            <span className="font-display text-sm font-semibold text-brand-blue">
              Endereço
            </span>
            <input
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              type="text"
              autoComplete="address-level2"
              placeholder="Cidade / endereço"
              className="hce-input mt-1.5"
            />
          </label>
        </div>

        <label className="block">
          <span className="font-display text-sm font-semibold text-brand-blue">
            LinkedIn <span className="font-normal text-muted">(link)</span>
          </span>
          <input
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
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
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
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
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
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
