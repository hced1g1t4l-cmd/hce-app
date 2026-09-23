"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  formatarBytes,
  formatarHoras,
  percentual,
  semaforo,
  type CheckItem,
} from "@/lib/sentinela";

export type SentinelaCheckRow = {
  id: string;
  origem: string;
  ok: boolean;
  dbOk: boolean;
  dbLatenciaMs: number | null;
  dbSizeBytes: number | null;
  naMidiaOk: boolean;
  naMidiaStatus: number | null;
  midiaCount: number | null;
  neonOk: boolean;
  neonComputeSeconds: number | null;
  neonStorageBytes: number | null;
  neonPeriodEndFmt: string | null;
  quandoFmt: string;
  quandoTs: number;
  itens: CheckItem[];
};

type Config = {
  secretConfigurado: boolean;
  neonConfigurado: boolean;
  appUrl: string;
  planoNome: string;
  storageIncluidoBytes: number;
  computeIncluidoHoras: number;
};

function Barra({ pct }: { pct: number | null }) {
  const p = pct == null ? 0 : Math.min(100, Math.max(0, pct));
  const cor =
    pct == null
      ? "bg-slate-300"
      : p >= 100
        ? "bg-red-500"
        : p >= 80
          ? "bg-amber-500"
          : "bg-emerald-500";
  return (
    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${p}%` }} />
    </div>
  );
}

export function SentinelaPainel({
  ultima,
  historico,
  config,
}: {
  ultima: SentinelaCheckRow | null;
  historico: SentinelaCheckRow[];
  config: Config;
}) {
  const router = useRouter();
  const [rodando, setRodando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function rodarAgora() {
    setRodando(true);
    setMsg(null);
    try {
      const res = await fetch("/api/adm/sentinela/run", { method: "POST" });
      if (res.ok) {
        const d = (await res.json()) as {
          ok: boolean;
          incidentesAbertos: string[];
          incidentesResolvidos: string[];
        };
        const partes: string[] = [];
        if (d.incidentesAbertos.length)
          partes.push(`${d.incidentesAbertos.length} incidente(s) aberto(s)`);
        if (d.incidentesResolvidos.length)
          partes.push(
            `${d.incidentesResolvidos.length} auto-resolvido(s)`,
          );
        setMsg(
          (d.ok ? "✅ Tudo no ar." : "⚠️ Encontramos algo fora.") +
            (partes.length ? ` ${partes.join(" · ")}.` : ""),
        );
        router.refresh();
      } else {
        setMsg("Não foi possível rodar a checagem agora.");
      }
    } catch {
      setMsg("Falha de rede ao rodar a checagem.");
    } finally {
      setRodando(false);
    }
  }

  const sem = semaforo(ultima?.ok ?? true);

  // Storage do Neon (o que conta no plano) e sua % vs. incluido.
  const storageBytes = ultima?.neonStorageBytes ?? null;
  const storagePct = percentual(storageBytes, config.storageIncluidoBytes);
  const computeHoras =
    ultima?.neonComputeSeconds != null
      ? ultima.neonComputeSeconds / 3600
      : null;
  const computePct = percentual(computeHoras, config.computeIncluidoHoras);

  return (
    <div className="space-y-6">
      {/* CABECALHO: semaforo + rodar agora */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${sem.dot}`} aria-hidden />
            <div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${sem.badge}`}
              >
                {sem.label}
              </span>
              <p className="mt-1 text-xs text-muted">
                {ultima
                  ? `Última checagem: ${ultima.quandoFmt} · origem ${ultima.origem}`
                  : "Nenhuma checagem ainda. Rode a primeira agora."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {msg && <span className="text-xs text-muted">{msg}</span>}
            <button
              onClick={rodarAgora}
              disabled={rodando}
              className="rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-deep disabled:opacity-60"
            >
              {rodando ? "Checando…" : "Rodar agora"}
            </button>
          </div>
        </div>

        {/* Itens da ultima checagem */}
        {ultima && ultima.itens.length > 0 && (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {ultima.itens.map((it) => (
              <div
                key={it.chave}
                className="flex items-start gap-2.5 rounded-xl border border-line bg-surface-soft/50 px-3 py-2.5"
              >
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    it.ok ? "bg-emerald-500" : "bg-red-500"
                  }`}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{it.label}</p>
                  <p className="text-xs text-muted">{it.detalhe}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAUDE DE INFRA: banco + neon */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tamanho do banco */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="font-display text-sm font-bold text-brand-blue">
            Tamanho do banco
          </h2>
          <p className="mt-2 text-2xl font-bold text-ink">
            {formatarBytes(ultima?.dbSizeBytes ?? null)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Latência atual:{" "}
            {ultima?.dbLatenciaMs != null ? `${ultima.dbLatenciaMs}ms` : "—"} ·{" "}
            {ultima?.midiaCount != null
              ? `${ultima.midiaCount} publicação(ões) no ar`
              : "—"}
          </p>
        </div>

        {/* Consumo Neon */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-brand-blue">
              Consumo Neon · plano {config.planoNome}
            </h2>
          </div>
          {config.neonConfigurado && ultima?.neonOk ? (
            <div className="mt-3 space-y-3">
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-ink">Compute</span>
                  <span className="text-muted">
                    {formatarHoras(ultima.neonComputeSeconds)} /{" "}
                    {config.computeIncluidoHoras} h
                    {computePct != null ? ` · ${computePct}%` : ""}
                  </span>
                </div>
                <Barra pct={computePct} />
              </div>
              <div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-semibold text-ink">Armazenamento</span>
                  <span className="text-muted">
                    {formatarBytes(storageBytes)} /{" "}
                    {formatarBytes(config.storageIncluidoBytes)}
                    {storagePct != null ? ` · ${storagePct}%` : ""}
                  </span>
                </div>
                <Barra pct={storagePct} />
              </div>
              {ultima.neonPeriodEndFmt && (
                <p className="text-xs text-muted">
                  Ciclo atual até {ultima.neonPeriodEndFmt}.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">
              API do Neon ainda não configurada. Defina{" "}
              <code className="rounded bg-surface-soft px-1">NEON_API_KEY</code>{" "}
              (e opcionalmente{" "}
              <code className="rounded bg-surface-soft px-1">
                NEON_PROJECT_ID
              </code>
              ) para acompanhar compute-hours e storage do ciclo.
            </p>
          )}
        </div>
      </div>

      {/* AVISO DE CONFIG DO CRON */}
      {!config.secretConfigurado && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-display text-sm font-bold text-amber-900">
            Falta ligar o agendamento (cron externo)
          </h2>
          <p className="mt-1 text-sm text-amber-900/90">
            Defina a variável{" "}
            <code className="rounded bg-amber-100 px-1">SENTINELA_SECRET</code>{" "}
            na Vercel e cadastre um cron gratuito (ex.: cron-job.org) chamando o
            endereço abaixo 2x/dia, com o header{" "}
            <code className="rounded bg-amber-100 px-1">
              Authorization: Bearer &lt;seu-segredo&gt;
            </code>
            :
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-amber-100/70 px-3 py-2 text-xs text-amber-900">
            {config.appUrl}/api/sentinela/check
          </pre>
        </div>
      )}

      {/* HISTORICO */}
      <div className="rounded-2xl border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-3">
          <h2 className="font-display text-sm font-bold text-brand-blue">
            Histórico de checagens
          </h2>
        </div>
        {historico.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nenhuma checagem registrada ainda.
          </p>
        ) : (
          <div className="hce-scroll-x overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-2 font-semibold">Quando</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Banco</th>
                  <th className="px-3 py-2 font-semibold">Tamanho</th>
                  <th className="px-3 py-2 font-semibold">/na-midia</th>
                  <th className="px-3 py-2 font-semibold">Compute</th>
                  <th className="px-5 py-2 font-semibold">Origem</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((c) => (
                  <tr key={c.id} className="border-b border-line/60">
                    <td className="px-5 py-2 whitespace-nowrap text-ink">
                      {c.quandoFmt}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          c.ok ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        aria-label={c.ok ? "ok" : "atenção"}
                      />
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">
                      {c.dbOk
                        ? c.dbLatenciaMs != null
                          ? `${c.dbLatenciaMs}ms`
                          : "ok"
                        : "fora"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">
                      {formatarBytes(c.dbSizeBytes)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">
                      {c.naMidiaStatus != null
                        ? `HTTP ${c.naMidiaStatus}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted">
                      {formatarHoras(c.neonComputeSeconds)}
                    </td>
                    <td className="px-5 py-2 whitespace-nowrap text-muted">
                      {c.origem}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
