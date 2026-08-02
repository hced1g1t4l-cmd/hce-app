"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type AdminItem = {
  id: string;
  login: string;
  nome: string;
  fotoUrl: string | null;
  emailPrincipal: string | null;
  ativo: boolean;
  precisaTrocarSenha: boolean;
  ultimoAcesso: string | null;
  criadoPor: string | null;
};

export function AdminsGerenciar({
  admins,
  meuId,
}: {
  admins: AdminItem[];
  meuId: string;
}) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [novaSenha, setNovaSenha] = useState<{
    login: string;
    senha: string;
  } | null>(null);
  const [ocupadoId, setOcupadoId] = useState<string | null>(null);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setNovaSenha(null);
    setSalvando(true);
    try {
      const res = await fetch("/api/adm/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          login: login.trim().toLowerCase(),
          emailPrincipal: email.trim(),
        }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        login?: string;
        senhaProvisoria?: string;
      };
      if (!res.ok) {
        setErro(d.error || "Não foi possível criar o admin.");
        setSalvando(false);
        return;
      }
      setNovaSenha({ login: d.login || login, senha: d.senhaProvisoria || "" });
      setNome("");
      setLogin("");
      setEmail("");
      setSalvando(false);
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setSalvando(false);
    }
  }

  async function acao(id: string, acao: string, confirmar?: string) {
    if (confirmar && !window.confirm(confirmar)) return;
    setOcupadoId(id);
    setErro(null);
    try {
      const res = await fetch(`/api/adm/admins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        error?: string;
        senhaProvisoria?: string;
      };
      if (!res.ok) {
        setErro(d.error || "Não foi possível concluir a ação.");
        setOcupadoId(null);
        return;
      }
      if (d.senhaProvisoria) {
        const alvo = admins.find((a) => a.id === id);
        setNovaSenha({
          login: alvo?.login || "",
          senha: d.senhaProvisoria,
        });
      }
      setOcupadoId(null);
      router.refresh();
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setOcupadoId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* NOVO ADMIN */}
      <section className="rounded-xl border border-line bg-white p-6">
        <h2 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
          Incluir novo admin
        </h2>
        <form onSubmit={criar} className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-sm font-semibold text-brand-blue">Nome</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Souza"
              className="hce-input mt-1.5"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-blue">Login</span>
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="ex.: maria.souza"
              className="hce-input mt-1.5 font-mono text-sm"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-brand-blue">
              E-mail{" "}
              <span className="font-normal text-muted">(opcional)</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@email.com"
              className="hce-input mt-1.5"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-blue px-6 py-2.5 font-display text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
            >
              {salvando ? "Criando…" : "Criar admin"}
            </button>
          </div>
        </form>

        {erro && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </p>
        )}
        {novaSenha && (
          <div className="mt-4 rounded-lg border border-brand-amber bg-brand-amber/10 px-4 py-3 text-sm">
            <p className="font-semibold text-brand-blue">
              Senha provisória gerada — anote e repasse com segurança:
            </p>
            <p className="mt-1">
              Login: <strong>{novaSenha.login}</strong> · Senha:{" "}
              <strong className="font-mono">{novaSenha.senha}</strong>
            </p>
            <p className="mt-1 text-xs text-muted">
              No primeiro acesso, a pessoa será obrigada a definir uma senha
              pessoal.
            </p>
          </div>
        )}
      </section>

      {/* LISTA */}
      <section className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-semibold">Admin</th>
              <th className="px-4 py-3 font-semibold">Login</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-b border-line/70">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {a.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.fotoUrl}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/10 text-xs font-bold text-brand-blue">
                        {a.nome
                          .trim()
                          .split(/\s+/)
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">
                        {a.nome}
                        {a.id === meuId && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            (você)
                          </span>
                        )}
                      </p>
                      {a.emailPrincipal && (
                        <p className="truncate text-xs text-muted">
                          {a.emailPrincipal}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted">
                  {a.login}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {a.ativo ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Ativo
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                      Inativo
                    </span>
                  )}
                  {a.precisaTrocarSenha && (
                    <span className="ml-2 rounded-full bg-brand-amber/25 px-2 py-0.5 text-xs font-semibold text-brand-amber-dark">
                      1º acesso
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        acao(
                          a.id,
                          "resetar",
                          `Gerar nova senha provisória para ${a.login}?`,
                        )
                      }
                      disabled={ocupadoId === a.id}
                      className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-brand-blue transition-colors hover:bg-surface-soft disabled:opacity-50"
                    >
                      Resetar senha
                    </button>
                    {a.ativo ? (
                      <button
                        type="button"
                        onClick={() =>
                          acao(
                            a.id,
                            "desativar",
                            `Desativar o acesso de ${a.login}?`,
                          )
                        }
                        disabled={ocupadoId === a.id || a.id === meuId}
                        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                      >
                        Desativar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => acao(a.id, "ativar")}
                        disabled={ocupadoId === a.id}
                        className="rounded-full border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50 disabled:opacity-50"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
