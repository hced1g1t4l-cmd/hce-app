import type { SVGProps } from "react";
import Image from "next/image";
import type { MidiaCard, MidiaTipo } from "@/lib/na-midia";

// Card no estilo "post de rede social" da seção Na Mídia. Compartilhado entre a
// página pública (/na-midia) e a pré-visualização do editor no /adm/na-midia.

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

function IconMicrofone(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </IconBase>
  );
}

function IconJornal(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h13v14H5a2 2 0 0 1-2-2V6" />
      <path d="M17 8h3v9a2 2 0 0 1-2 2" />
      <path d="M7 9h6" />
      <path d="M7 13h6" />
      <path d="M7 17h4" />
    </IconBase>
  );
}

function IconEntrevista(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h16v11H8l-4 4z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </IconBase>
  );
}

function IconVideo(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m15 10 6-3v10l-6-3z" />
    </IconBase>
  );
}

function IconArtigo(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </IconBase>
  );
}

function LinkExterno(props: IconProps) {
  return (
    <IconBase {...props} strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}

// Ícone + gradiente do cabeçalho por tipo (fallback quando não há thumbnail).
const TIPO_ICONE: Record<
  MidiaTipo,
  { Icone: (props: IconProps) => React.ReactElement; gradiente: string }
> = {
  Coluna: { Icone: IconJornal, gradiente: "from-brand-blue to-brand-blue-deep" },
  Podcast: {
    Icone: IconMicrofone,
    gradiente: "from-brand-blue-deep to-brand-blue",
  },
  Entrevista: {
    Icone: IconEntrevista,
    gradiente: "from-brand-blue to-brand-blue-deep",
  },
  Vídeo: { Icone: IconVideo, gradiente: "from-brand-blue-deep to-brand-blue" },
  Artigo: { Icone: IconArtigo, gradiente: "from-brand-blue to-brand-blue-deep" },
};

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

export function CardMidia({ item }: { item: MidiaCard }) {
  const { Icone, gradiente } = TIPO_ICONE[item.tipo] ?? TIPO_ICONE.Artigo;
  return (
    <article className="reveal group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-brand transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-amber hover:shadow-brand-lg motion-reduce:transform-none motion-reduce:transition-none">
      {/* TOPO: thumbnail real (16/9) ou cabeçalho de marca (fallback). */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-blue">
        {item.thumb ? (
          <Image
            src={item.thumb}
            alt={item.titulo}
            fill
            sizes="(max-width: 640px) 90vw, 360px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
            style={{ objectPosition: item.thumbPos ?? "center" }}
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradiente}`}
          >
            <div
              aria-hidden
              className="hce-hero-pattern pointer-events-none absolute inset-0 opacity-40"
            />
            <span
              aria-hidden
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-brand-amber ring-1 ring-white/15 transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none"
            >
              <Icone className="h-8 w-8" />
            </span>
          </div>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"
        />

        <span className="absolute top-4 left-4 z-10 rounded-full bg-brand-amber px-3 py-1 font-display text-xs font-semibold text-brand-blue-deep shadow-brand">
          {item.tipo}
        </span>

        {item.logoVeiculo && (
          <span className="absolute top-4 right-4 z-10 inline-flex items-center rounded-lg bg-white/90 px-2 py-1 shadow-brand ring-1 ring-black/5 backdrop-blur-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.logoVeiculo}
              alt={item.logoAlt ?? item.veiculo}
              className={`object-contain ${item.logoClasse ?? "h-4 w-auto"}`}
            />
          </span>
        )}

        <span className="absolute bottom-3 left-4 z-10 font-display text-xs font-semibold tracking-wide text-white/95 drop-shadow">
          {item.veiculo}
        </span>
      </div>

      {/* CORPO */}
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <Image
              src={item.avatar}
              alt={item.autor}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-brand"
            />
          ) : (
            <span
              aria-hidden
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue font-display text-sm font-bold text-brand-amber ring-2 ring-white shadow-brand"
            >
              {iniciais(item.autor)}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-brand-blue">
              {item.autor}
            </p>
            <p className="truncate text-xs text-muted">{item.veiculo}</p>
          </div>
        </div>

        <h2 className="mt-4 font-display text-lg font-bold text-brand-blue">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.titulo} — ${item.tipo} de ${item.autor} (abre em nova aba)`}
            className="underline-offset-4 outline-none after:absolute after:inset-0 focus-visible:underline focus-visible:decoration-brand-amber"
          >
            {item.titulo}
          </a>
        </h2>
        {item.descricao && (
          <p className="mt-2 flex-1 leading-relaxed text-muted">
            {item.descricao}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-brand-amber-dark transition-transform duration-300 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none">
            Ver conteúdo
            <LinkExterno className="h-4 w-4" />
          </span>

          {item.linksExtras.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-2">
              {item.linksExtras.map((lk) => (
                <a
                  key={lk.url}
                  href={lk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${lk.label} de ${item.titulo} (abre em nova aba)`}
                  className="rounded-full border border-line px-3 py-1 font-display text-xs font-semibold text-brand-blue transition-colors hover:border-brand-amber hover:text-brand-amber-dark"
                >
                  {lk.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
