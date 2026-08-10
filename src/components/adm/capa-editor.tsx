"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Editor da imagem de capa do artigo.
//  - Enquadramento fixo 16:9 (igual ao site). A foto pode ser arrastada e
//    ampliada dentro do quadro (para posicionar o recorte).
//  - Ajustes: brilho, contraste, ângulo (girar), espelhar horizontal/vertical.
//  - Marca d'água semitransparente (logo HCE): por padrão pequena no canto
//    inferior direito, arrastável com o mouse para qualquer posição.
//  - Ao aplicar, tudo é "queimado" numa nova imagem 16:9 e reenviada, de modo
//    que o site mostre exatamente o enquadramento escolhido.

const EXPORT_W = 1600;
const EXPORT_H = 900;
const MARCA_SRC = "/brand/logos/logo-hce.png";

type Modo = "pan" | "marca" | null;

export function CapaEditor({
  src,
  onCancelar,
  onAplicar,
}: {
  src: string;
  onCancelar: () => void;
  onAplicar: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const marcaRef = useRef<HTMLImageElement | null>(null);
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Transformações da foto
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const [angulo, setAngulo] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [brilho, setBrilho] = useState(100); // %
  const [contraste, setContraste] = useState(100); // %

  // Marca d'água — desligada por padrão: as fotos da HCE já vêm com o logo
  // "de fábrica", então ligar por padrão gerava um segundo logo empilhado.
  // Fica como opção para o caso de uma foto sem marca.
  const [marcaOn, setMarcaOn] = useState(false);
  const [marcaTam, setMarcaTam] = useState(0.18); // fração da largura
  const [marcaOpac, setMarcaOpac] = useState(0.7);
  const [marca, setMarca] = useState({ x: 0, y: 0 }); // centro em px de export

  const arraste = useRef<{ modo: Modo; x: number; y: number }>({
    modo: null,
    x: 0,
    y: 0,
  });

  // Carrega foto + marca d'água
  useEffect(() => {
    let vivo = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    const marcaImg = new Image();
    marcaImg.crossOrigin = "anonymous";
    let fotoOk = false;
    let marcaFeita = false; // carregada OU falhou (não bloqueia)
    const talvezPronto = () => {
      if (!vivo || !fotoOk || !marcaFeita) return;
      imgRef.current = img;
      marcaRef.current = marcaImg.naturalWidth ? marcaImg : null;
      // posição padrão da marca: canto inferior direito
      const razao = marcaImg.naturalWidth
        ? marcaImg.naturalHeight / marcaImg.naturalWidth
        : 0.42;
      const mw = marcaTam * EXPORT_W;
      const mh = mw * razao;
      setMarca({ x: EXPORT_W - 40 - mw / 2, y: EXPORT_H - 40 - mh / 2 });
      setPronto(true);
    };
    img.onload = () => {
      fotoOk = true;
      talvezPronto();
    };
    img.onerror = () => vivo && setErro("Não foi possível carregar a imagem.");
    marcaImg.onload = () => {
      marcaFeita = true;
      talvezPronto();
    };
    marcaImg.onerror = () => {
      marcaFeita = true;
      talvezPronto();
    };
    img.src = src;
    marcaImg.src = MARCA_SRC;
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // Trava rolagem do fundo + Esc para cancelar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancelar();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancelar]);

  const desenhar = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, EXPORT_W, EXPORT_H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);

    // Foto (cobre o quadro por padrão) com brilho/contraste/rotação/espelho
    const cover = Math.max(EXPORT_W / img.width, EXPORT_H / img.height);
    const s = cover * zoom;
    const w = img.width * s;
    const h = img.height * s;
    ctx.save();
    ctx.filter = `brightness(${brilho}%) contrast(${contraste}%)`;
    ctx.translate(EXPORT_W / 2 + off.x, EXPORT_H / 2 + off.y);
    ctx.rotate((angulo * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();

    // Marca d'água
    const marcaImg = marcaRef.current;
    if (marcaOn && marcaImg) {
      const mw = marcaTam * EXPORT_W;
      const mh = (mw * marcaImg.naturalHeight) / marcaImg.naturalWidth;
      ctx.save();
      ctx.globalAlpha = marcaOpac;
      ctx.filter = "none";
      ctx.drawImage(marcaImg, marca.x - mw / 2, marca.y - mh / 2, mw, mh);
      ctx.restore();
    }
  }, [
    zoom,
    off,
    angulo,
    flipH,
    flipV,
    brilho,
    contraste,
    marcaOn,
    marcaTam,
    marcaOpac,
    marca,
  ]);

  useEffect(() => {
    if (pronto) desenhar();
  }, [pronto, desenhar]);

  // Converte coordenada do ponteiro para px de export
  const paraExport = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * EXPORT_W,
      y: ((clientY - r.top) / r.height) * EXPORT_H,
    };
  };

  const dentroDaMarca = (x: number, y: number) => {
    const marcaImg = marcaRef.current;
    if (!marcaOn || !marcaImg) return false;
    const mw = marcaTam * EXPORT_W;
    const mh = (mw * marcaImg.naturalHeight) / marcaImg.naturalWidth;
    return (
      x >= marca.x - mw / 2 &&
      x <= marca.x + mw / 2 &&
      y >= marca.y - mh / 2 &&
      y <= marca.y + mh / 2
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const p = paraExport(e.clientX, e.clientY);
    const modo: Modo = dentroDaMarca(p.x, p.y) ? "marca" : "pan";
    arraste.current = { modo, x: p.x, y: p.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!arraste.current.modo) return;
    const p = paraExport(e.clientX, e.clientY);
    const dx = p.x - arraste.current.x;
    const dy = p.y - arraste.current.y;
    arraste.current.x = p.x;
    arraste.current.y = p.y;
    if (arraste.current.modo === "marca") {
      setMarca((m) => ({ x: m.x + dx, y: m.y + dy }));
    } else {
      setOff((o) => ({ x: o.x + dx, y: o.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    arraste.current.modo = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const fator = e.deltaY < 0 ? 1.06 : 1 / 1.06;
    setZoom((z) => Math.min(5, Math.max(0.2, z * fator)));
  };

  function resetar() {
    setZoom(1);
    setOff({ x: 0, y: 0 });
    setAngulo(0);
    setFlipH(false);
    setFlipV(false);
    setBrilho(100);
    setContraste(100);
  }

  async function aplicar() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSalvando(true);
    setErro(null);
    desenhar();
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setErro("Falha ao gerar a imagem.");
          setSalvando(false);
          return;
        }
        onAplicar(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col p-3 sm:p-6">
        <div className="flex items-center justify-between gap-3 pb-3 text-white">
          <h2 className="font-display text-lg font-bold">Editar imagem de capa</h2>
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            Fechar ✕
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto rounded-2xl bg-white p-4 lg:grid-cols-[1fr_300px]">
          {/* PALCO */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-xl border border-line shadow-sm">
              <canvas
                ref={canvasRef}
                width={EXPORT_W}
                height={EXPORT_H}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onWheel={onWheel}
                className="block w-full cursor-move touch-none select-none"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              Arraste a foto para posicionar. Use a roda do mouse ou o controle
              de zoom para ampliar. Arraste a marca d&apos;água para movê-la.
            </p>
            {erro && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {erro}
              </p>
            )}
          </div>

          {/* CONTROLES */}
          <aside className="space-y-4">
            <Grupo titulo="Enquadramento">
              <Range
                label="Zoom"
                min={0.2}
                max={5}
                step={0.01}
                value={zoom}
                onChange={setZoom}
                fmt={(v) => `${Math.round(v * 100)}%`}
              />
              <Range
                label="Ângulo (girar)"
                min={-180}
                max={180}
                step={1}
                value={angulo}
                onChange={setAngulo}
                fmt={(v) => `${v}°`}
              />
              <div className="flex flex-wrap gap-2">
                <MiniBtn onClick={() => setAngulo((a) => a - 90)}>
                  ⟲ 90°
                </MiniBtn>
                <MiniBtn onClick={() => setAngulo((a) => a + 90)}>
                  ⟳ 90°
                </MiniBtn>
                <MiniBtn ativo={flipH} onClick={() => setFlipH((v) => !v)}>
                  Espelhar ↔
                </MiniBtn>
                <MiniBtn ativo={flipV} onClick={() => setFlipV((v) => !v)}>
                  Espelhar ↕
                </MiniBtn>
              </div>
            </Grupo>

            <Grupo titulo="Ajustes de imagem">
              <Range
                label="Brilho"
                min={50}
                max={150}
                step={1}
                value={brilho}
                onChange={setBrilho}
                fmt={(v) => `${v}%`}
              />
              <Range
                label="Contraste"
                min={50}
                max={150}
                step={1}
                value={contraste}
                onChange={setContraste}
                fmt={(v) => `${v}%`}
              />
              <button
                type="button"
                onClick={resetar}
                className="text-xs font-semibold text-brand-blue hover:underline"
              >
                Restaurar padrões
              </button>
            </Grupo>

            <Grupo titulo="Marca d'água">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={marcaOn}
                  onChange={(e) => setMarcaOn(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-brand-blue"
                />
                Exibir marca d&apos;água (logo HCE)
              </label>
              <Range
                label="Tamanho"
                min={0.06}
                max={0.4}
                step={0.01}
                value={marcaTam}
                onChange={setMarcaTam}
                fmt={(v) => `${Math.round(v * 100)}%`}
                disabled={!marcaOn}
              />
              <Range
                label="Transparência"
                min={0.1}
                max={1}
                step={0.05}
                value={marcaOpac}
                onChange={setMarcaOpac}
                fmt={(v) => `${Math.round(v * 100)}%`}
                disabled={!marcaOn}
              />
              <p className="text-xs text-muted">
                Padrão: pequena no canto inferior direito. Arraste sobre a
                imagem para reposicionar.
              </p>
            </Grupo>
          </aside>
        </div>

        {/* AÇÕES */}
        <div className="flex flex-wrap justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={aplicar}
            disabled={!pronto || salvando}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-amber px-6 py-2.5 font-display text-sm font-semibold text-brand-blue-deep transition-colors hover:bg-brand-amber-dark disabled:opacity-60"
          >
            {salvando ? "Aplicando…" : "Aplicar e usar como capa"}
          </button>
        </div>
      </div>
    </div>
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

function Range({
  label,
  min,
  max,
  step,
  value,
  onChange,
  fmt,
  disabled,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <label className={disabled ? "block opacity-50" : "block"}>
      <span className="flex items-center justify-between text-xs font-semibold text-ink">
        {label}
        <span className="font-mono text-muted">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-brand-blue"
      />
    </label>
  );
}

function MiniBtn({
  children,
  onClick,
  ativo,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ativo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors " +
        (ativo
          ? "border-brand-blue bg-brand-blue text-white"
          : "border-line text-brand-blue hover:bg-white")
      }
    >
      {children}
    </button>
  );
}
