"use client";

import { useMemo, useState } from "react";

export type LogRow = {
  id: string;
  quando: string; // formatado
  adminLogin: string;
  acao: string;
  detalhe: string | null;
  ip: string | null;
};

// Rotulos amigaveis para as acoes registradas.
const ROTULOS: Record<string, string> = {
  login: "Entrou",
  "login.falha": "Falha de login",
  logout: "Saiu",
  "senha.trocar": "Trocou a própria senha",
  "senha.reset.solicitar": "Pediu recuperação de senha",
  "senha.reset.concluir": "Redefiniu a senha por e-mail",
  "perfil.foto": "Atualizou a foto",
  "perfil.foto.remover": "Removeu a foto",
  "perfil.emails": "Atualizou e-mails de resgate",
  "admin.criar": "Criou um admin",
  "admin.desativar": "Desativou um admin",
  "admin.ativar": "Reativou um admin",
  "admin.resetar-senha": "Resetou senha de um admin",
  "artigo.criar": "Criou artigo",
  "artigo.editar": "Editou artigo",
  "artigo.publicar": "Publicou artigo",
  "artigo.excluir": "Excluiu artigo",
  "midia.enviar": "Enviou mídia",
  "midia.excluir": "Excluiu mídia",
  "usuario.excluir": "Excluiu usuário",
};

function rotulo(acao: string): string {
  return ROTULOS[acao] ?? acao;
}

export function LogsTabela({ logs }: { logs: LogRow[] }) {
  const [busca, setBusca] = useState("");
  const [acao, setAcao] = useState("");

  const acoes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.acao))).sort(),
    [logs],
  );

  const linhas = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase("pt-BR");
    return logs.filter((l) => {
      if (acao && l.acao !== acao) return false;
      if (q) {
        const alvo = [
          l.adminLogin,
          rotulo(l.acao),
          l.acao,
          l.detalhe ?? "",
          l.ip ?? "",
          l.quando,
        ]
          .join(" ")
          .toLocaleLowerCase("pt-BR");
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [logs, busca, acao]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por admin, ação, detalhe, IP…"
          type="search"
          className="hce-input flex-1 sm:max-w-md"
        />
        <select
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          aria-label="Filtrar por ação"
        >
          <option value="">Todas as ações</option>
          {acoes.map((a) => (
            <option key={a} value={a}>
              {rotulo(a)}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted">
          {linhas.length} de {logs.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface-soft text-xs tracking-wide text-muted uppercase">
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Quando
              </th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">
                Admin
              </th>
              <th className="px-4 py-3 font-semibold">Ação</th>
              <th className="px-4 py-3 font-semibold">Detalhe</th>
              <th className="px-4 py-3 font-semibold whitespace-nowrap">IP</th>
            </tr>
          </thead>
          <tbody>
            {linhas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Nenhum registro com esses filtros.
                </td>
              </tr>
            ) : (
              linhas.map((l) => (
                <tr key={l.id} className="border-b border-line/70">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {l.quando}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-brand-blue">
                    {l.adminLogin}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs font-semibold " +
                        (l.acao === "login.falha"
                          ? "bg-red-100 text-red-700"
                          : "bg-brand-blue/10 text-brand-blue")
                      }
                    >
                      {rotulo(l.acao)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{l.detalhe ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-muted">
                    {l.ip ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
