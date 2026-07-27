"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export type UsuarioAdm = {
  id: string;
  name: string | null;
  email: string | null;
  telefone: string | null;
  plano: string;
  aceitaComunicacoes: boolean;
  cadastro: string;
  image: string | null;
  bio: string | null;
  endereco: string | null;
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
};

const PLANO_LABEL: Record<string, string> = {
  free: "Gratuito",
  essencial: "Essencial",
  profissional: "Profissional",
  premium: "Premium",
};

function iniciais(nome: string | null): string {
  if (!nome) return "•";
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase();
}

function Avatar({
  image,
  nome,
  size,
}: {
  image: string | null;
  nome: string | null;
  size: number;
}) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-soft font-display font-bold text-brand-blue/50"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {image ? (
        <Image
          src={image}
          alt={nome ?? "Foto"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      ) : (
        iniciais(nome)
      )}
    </span>
  );
}

export function UsuariosTabela({ usuarios }: { usuarios: UsuarioAdm[] }) {
  const [aberto, setAberto] = useState<UsuarioAdm | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-semibold">Pessoa</th>
              <th className="px-4 py-3 font-semibold">E-mail</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Telefone
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">Plano</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Cadastro
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Comunic.
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr
                key={u.id}
                onClick={() => setAberto(u)}
                className="cursor-pointer border-b border-line/70 transition-colors hover:bg-surface-soft"
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar image={u.image} nome={u.name} size={36} />
                    <span className="font-medium text-ink">{u.name ?? "—"}</span>
                  </span>
                </td>
                <td className="px-4 py-3 break-all text-muted">
                  {u.email ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {u.telefone ?? "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    {PLANO_LABEL[u.plano] ?? u.plano}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {u.cadastro}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {u.aceitaComunicacoes ? (
                    <span className="rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                      Sim
                    </span>
                  ) : (
                    <span className="text-muted">Não</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Dados de ${aberto.name ?? "usuário"}`}
          onClick={() => setAberto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-blue-deep/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar image={aberto.image} nome={aberto.name} size={64} />
                <div>
                  <h2 className="font-display text-lg font-bold text-brand-blue">
                    {aberto.name ?? "—"}
                  </h2>
                  <span className="mt-1 inline-block rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                    {PLANO_LABEL[aberto.plano] ?? aberto.plano}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAberto(null)}
                aria-label="Fechar"
                className="rounded-full p-1 text-2xl leading-none text-muted transition-colors hover:bg-surface-soft hover:text-brand-blue"
              >
                ×
              </button>
            </div>

            {aberto.bio && (
              <p className="mt-5 text-sm leading-relaxed text-ink">
                {aberto.bio}
              </p>
            )}

            <dl className="mt-5 space-y-3 text-sm">
              <Campo rotulo="E-mail">
                {aberto.email ? (
                  <a
                    href={`mailto:${aberto.email}`}
                    className="break-all text-brand-blue hover:underline"
                  >
                    {aberto.email}
                  </a>
                ) : (
                  "—"
                )}
              </Campo>
              <Campo rotulo="Telefone">{aberto.telefone ?? "—"}</Campo>
              <Campo rotulo="Endereço">{aberto.endereco ?? "—"}</Campo>
              <Campo rotulo="Cadastro">{aberto.cadastro}</Campo>
              <Campo rotulo="Comunicações">
                {aberto.aceitaComunicacoes ? "Aceita" : "Não aceita"}
              </Campo>
            </dl>

            {(aberto.linkedin || aberto.instagram || aberto.facebook) && (
              <div className="mt-5 border-t border-line pt-4">
                <p className="text-xs tracking-wide text-muted uppercase">
                  Redes sociais
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {aberto.linkedin && (
                    <LinkRede href={aberto.linkedin} label="LinkedIn" />
                  )}
                  {aberto.instagram && (
                    <LinkRede href={aberto.instagram} label="Instagram" />
                  )}
                  {aberto.facebook && (
                    <LinkRede href={aberto.facebook} label="Facebook" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-xs tracking-wide text-muted uppercase">
        {rotulo}
      </dt>
      <dd className="font-medium text-ink">{children}</dd>
    </div>
  );
}

function LinkRede({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="rounded-full border border-line px-3 py-1 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft"
    >
      {label} ↗
    </a>
  );
}
