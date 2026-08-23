"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type UsuarioAdm = {
  id: string;
  name: string | null;
  email: string | null;
  telefone: string | null;
  plano: string;
  aceitaComunicacoes: boolean;
  cadastro: string;
  ultimoAcesso: string | null;
  image: string | null;
  bio: string | null;
  endereco: string | null;
  linkedin: string | null;
  instagram: string | null;
  facebook: string | null;
};

const PLANO_LABEL: Record<string, string> = {
  free: "Gratuito",
  essencial: "Básico",
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
  const router = useRouter();
  const [aberto, setAberto] = useState<UsuarioAdm | null>(null);
  const [confirmar, setConfirmar] = useState<UsuarioAdm | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAberto(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  async function excluir(u: UsuarioAdm) {
    setExcluindo(true);
    setErro(null);
    try {
      const res = await fetch(`/api/adm/usuarios/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Não foi possível excluir a conta.");
      }
      setConfirmar(null);
      setAberto(null);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setExcluindo(false);
    }
  }

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
                Último acesso
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
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  {u.ultimoAcesso ?? "—"}
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
              <Campo rotulo="Último acesso">
                {aberto.ultimoAcesso ?? "—"}
              </Campo>
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

            <div className="mt-6 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  setErro(null);
                  setConfirmar(aberto);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
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
                  aria-hidden="true"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão"
          onClick={() => !excluindo && setConfirmar(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-blue-deep/60 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="font-display text-lg font-bold text-brand-blue">
              Excluir conta
            </h2>
            <p className="mt-2 text-sm text-ink">
              Tem certeza que deseja excluir a conta de{" "}
              <strong>{confirmar.name ?? confirmar.email ?? "usuário"}</strong>?
              Esta ação é permanente e não pode ser desfeita.
            </p>

            {erro && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {erro}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={excluindo}
                onClick={() => setConfirmar(null)}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={excluindo}
                onClick={() => excluir(confirmar)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {excluindo ? "Excluindo…" : "Excluir"}
              </button>
            </div>
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
