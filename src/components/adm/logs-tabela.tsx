"use client";

import { useMemo, useState } from "react";
import { baixarCSV, baixarXLS } from "@/lib/export-cliente";

export type LogRow = {
  id: string;
  quando: string; // formatado (dd/mm/aaaa hh:mm:ss)
  dia: string; // yyyy-mm-dd (fuso SP) para filtro por período
  adminLogin: string;
  acao: string;
  detalhe: string | null;
  ip: string | null;
};

// Data de hoje (yyyy-mm-dd) no fuso de São Paulo.
const fmtDiaSP = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Sao_Paulo",
});
function diaSP(d: Date): string {
  return fmtDiaSP.format(d);
}
function diasAtras(n: number): string {
  return diaSP(new Date(Date.now() - n * 86400000));
}

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

const PRESETS: { id: string; label: string; de: () => string }[] = [
  { id: "hoje", label: "Hoje", de: () => diasAtras(0) },
  { id: "7d", label: "7 dias", de: () => diasAtras(6) },
  { id: "30d", label: "30 dias", de: () => diasAtras(29) },
];

export function LogsTabela({ logs }: { logs: LogRow[] }) {
  const [busca, setBusca] = useState("");
  const [acao, setAcao] = useState("");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");

  const acoes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.acao))).sort(),
    [logs],
  );

  const linhas = useMemo(() => {
    const q = busca.trim().toLocaleLowerCase("pt-BR");
    return logs.filter((l) => {
      if (acao && l.acao !== acao) return false;
      if (de && l.dia < de) return false;
      if (ate && l.dia > ate) return false;
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
  }, [logs, busca, acao, de, ate]);

  const temFiltro = Boolean(busca.trim() || acao || de || ate);

  function aplicarPreset(deVal: string) {
    setDe(deVal);
    setAte(diasAtras(0));
  }

  // Colunas e linhas do export (o que estiver filtrado na tela).
  function dadosExport(): { colunas: string[]; linhas: string[][] } {
    const colunas = ["Quando", "Admin", "Ação", "Detalhe", "IP"];
    const dados = linhas.map((l) => [
      l.quando,
      l.adminLogin,
      rotulo(l.acao),
      l.detalhe ?? "",
      l.ip ?? "",
    ]);
    return { colunas, linhas: dados };
  }

  function nomeArquivo(ext: string): string {
    const hoje = diasAtras(0);
    return `hce-logs-${hoje}.${ext}`;
  }

  function exportarCSV() {
    const { colunas, linhas: dados } = dadosExport();
    baixarCSV(nomeArquivo("csv"), colunas, dados);
  }
  function exportarXLS() {
    const { colunas, linhas: dados } = dadosExport();
    const geradoEm = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(new Date());
    baixarXLS(nomeArquivo("xls"), "Logs de auditoria", colunas, dados, geradoEm);
  }

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

      {/* Período + exportação */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold tracking-wide text-muted uppercase">
            De
          </span>
          <input
            type="date"
            value={de}
            max={ate || undefined}
            onChange={(e) => setDe(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold tracking-wide text-muted uppercase">
            Até
          </span>
          <input
            type="date"
            value={ate}
            min={de || undefined}
            onChange={(e) => setAte(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </label>

        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => aplicarPreset(p.de())}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-surface-soft"
            >
              {p.label}
            </button>
          ))}
          {temFiltro && (
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setAcao("");
                setDe("");
                setAte("");
              }}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={exportarCSV}
            disabled={linhas.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-soft disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            type="button"
            onClick={exportarXLS}
            disabled={linhas.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-semibold text-brand-amber transition-colors hover:bg-brand-blue-dark disabled:opacity-50"
          >
            Exportar Excel
          </button>
        </div>
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
