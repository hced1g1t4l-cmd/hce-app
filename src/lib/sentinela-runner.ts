// Motor de execucao do Sentinela. Roda a bateria de checagens de saude, grava
// um SentinelaCheck (historico/tendencia) e abre/auto-resolve incidentes.
//
// Reutilizado por dois pontos de entrada:
//   - /api/sentinela/check  (cron externo, protegido por segredo) -> origem "cron"
//   - /api/adm/sentinela/run (botao "Rodar agora", admin)         -> origem "manual"
//
// Observacao importante: o "armazem" de incidentes e o proprio banco. Se o
// banco estiver TOTALMENTE fora (cenario INC_001), nao ha como gravar nada la.
// Por isso o valor PROATIVO principal e o alerta de consumo do Neon (que roda
// enquanto o banco ainda esta de pe) + o cron externo, que percebe a resposta
// 503 e podera notificar. As checagens que dependem de escrita so rodam quando
// o banco responde.

import { prisma } from "@/lib/db";
import { logAdm } from "@/lib/adm";
import { neonConsumo } from "@/lib/neon";
import {
  ASSINATURAS,
  SENTINELA_AUTOR,
  NEON_PLANO,
  limiteAlertaDbBytes,
  limiteAlertaNeonPct,
  formatarBytes,
  formatarHoras,
  type CheckItem,
  type SentinelaResultado,
  type Assinatura,
} from "@/lib/sentinela";

const fmtBR = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

// URL publica do app, para checar a pagina /na-midia "de fora".
function baseUrl(): string | null {
  const env = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (env && /^https?:\/\//.test(env)) return env.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return null;
}

// --- Helpers de incidente (dedup + auto-resolucao) ---
// So mexem em incidentes de origem "sentinela"; nunca tocam nos manuais.

async function abrirOuAtualizarAuto(args: {
  assinatura: Assinatura;
  titulo: string;
  severidade: "alta" | "media" | "baixa";
  detalhe: string;
  quando: Date;
}): Promise<"aberto" | "atualizado"> {
  const { assinatura, titulo, severidade, detalhe, quando } = args;
  const ativo = await prisma.incidente.findFirst({
    where: {
      assinatura,
      origem: "sentinela",
      status: { in: ["aberto", "em_andamento"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (ativo) {
    // Ja existe: apenas anexa a nova ocorrencia (evita duplicar incidentes).
    await prisma.incidente.update({
      where: { id: ativo.id },
      data: {
        detalhamento:
          `${ativo.detalhamento}\n\n▶️ Nova ocorrência detectada em ${fmtBR.format(quando)}\n${detalhe}`.slice(
            0,
            20000,
          ),
      },
    });
    return "atualizado";
  }

  await prisma.incidente.create({
    data: {
      titulo,
      detalhamento: `▶️ Detectado automaticamente pelo Sentinela em ${fmtBR.format(quando)}\n\n${detalhe}`,
      severidade,
      status: "em_andamento",
      origem: "sentinela",
      assinatura,
      abertoPorNome: SENTINELA_AUTOR,
      abertoEm: quando,
      emAndamentoEm: quando,
      emAndamentoPorNome: SENTINELA_AUTOR,
    },
  });
  await logAdm({
    adminLogin: "sentinela",
    acao: "sentinela.incidente.abrir",
    detalhe: `${assinatura} · "${titulo}"`,
  });
  return "aberto";
}

async function resolverAuto(args: {
  assinatura: Assinatura;
  nota: string;
  quando: Date;
}): Promise<boolean> {
  const { assinatura, nota, quando } = args;
  const ativo = await prisma.incidente.findFirst({
    where: {
      assinatura,
      origem: "sentinela",
      status: { in: ["aberto", "em_andamento"] },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!ativo) return false;

  await prisma.incidente.update({
    where: { id: ativo.id },
    data: {
      status: "resolvido",
      resolvidoEm: quando,
      resolvidoPorNome: SENTINELA_AUTOR,
      detalhamento:
        `${ativo.detalhamento}\n\n✅ Normalizado automaticamente em ${fmtBR.format(quando)}. ${nota}`.slice(
          0,
          20000,
        ),
    },
  });
  await logAdm({
    adminLogin: "sentinela",
    acao: "sentinela.incidente.resolver",
    detalhe: `${assinatura} · "${ativo.titulo}"`,
  });
  return true;
}

// --- Execucao principal ---

export async function runSentinela(
  origem: "cron" | "manual",
): Promise<SentinelaResultado> {
  const quando = new Date();
  const itens: CheckItem[] = [];
  const abertos: string[] = [];
  const resolvidos: string[] = [];

  // 1) Banco: conectividade + latencia.
  let dbOk = false;
  let dbLatenciaMs: number | null = null;
  {
    const t0 = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatenciaMs = Date.now() - t0;
      dbOk = true;
    } catch (e) {
      dbOk = false;
      console.error("[sentinela] banco inacessivel:", e);
    }
  }
  itens.push({
    chave: "db",
    label: "Banco de dados",
    ok: dbOk,
    critico: true,
    detalhe: dbOk
      ? `conectado em ${dbLatenciaMs}ms`
      : "sem conexao (banco fora do ar)",
  });

  // 2) Tamanho do banco (so se o banco responde).
  let dbSizeBytes: bigint | null = null;
  if (dbOk) {
    try {
      const rows = await prisma.$queryRaw<
        { size: bigint }[]
      >`SELECT pg_database_size(current_database()) AS size`;
      dbSizeBytes = rows[0]?.size ?? null;
    } catch (e) {
      console.error("[sentinela] falha ao medir tamanho do banco:", e);
    }
  }
  itens.push({
    chave: "db_size",
    label: "Tamanho do banco",
    ok: true,
    critico: false,
    detalhe: dbSizeBytes != null ? formatarBytes(Number(dbSizeBytes)) : "—",
  });

  // 3) Conteudo essencial: publicacoes do "Na Mídia".
  let midiaCount: number | null = null;
  if (dbOk) {
    try {
      midiaCount = await prisma.midiaItem.count({
        where: { publicado: true },
      });
    } catch (e) {
      console.error("[sentinela] falha ao contar midia:", e);
    }
  }
  itens.push({
    chave: "midia",
    label: "Publicações no ar (Na Mídia)",
    ok: midiaCount == null || midiaCount > 0,
    critico: false,
    detalhe: midiaCount != null ? `${midiaCount} publicada(s)` : "—",
  });

  // 4) Pagina publica /na-midia responde 200 (checagem "de fora").
  let naMidiaChecado = false;
  let naMidiaOk = false;
  let naMidiaStatus: number | null = null;
  {
    const base = baseUrl();
    if (base) {
      naMidiaChecado = true;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      try {
        const res = await fetch(`${base}/na-midia`, {
          signal: ctrl.signal,
          cache: "no-store",
          redirect: "manual",
        });
        naMidiaStatus = res.status;
        naMidiaOk = res.status >= 200 && res.status < 400;
      } catch (e) {
        naMidiaOk = false;
        console.error("[sentinela] falha ao acessar /na-midia:", e);
      } finally {
        clearTimeout(timer);
      }
    }
  }
  itens.push({
    chave: "na_midia",
    label: "Página /na-midia",
    ok: naMidiaChecado ? naMidiaOk : true,
    critico: naMidiaChecado,
    detalhe: naMidiaChecado
      ? naMidiaOk
        ? `HTTP ${naMidiaStatus}`
        : `fora do ar (HTTP ${naMidiaStatus ?? "sem resposta"})`
      : "URL pública não configurada",
  });

  // 5) Consumo do Neon (compute-hours + storage do ciclo).
  const neon = await neonConsumo();
  const neonOk = neon != null;
  const neonHoras =
    neon?.computeSegundos != null ? neon.computeSegundos / 3600 : null;
  const neonPct =
    neonHoras != null
      ? Math.round((neonHoras / NEON_PLANO.computeIncluidoHoras) * 1000) / 10
      : null;
  itens.push({
    chave: "neon",
    label: "Consumo do banco (Neon)",
    ok: true,
    critico: false,
    detalhe: neonOk
      ? `${formatarHoras(neon?.computeSegundos)} de compute` +
        (neonPct != null ? ` (~${neonPct}% da referência)` : "") +
        (neon?.storageBytes != null
          ? ` · ${formatarBytes(neon.storageBytes)} de storage`
          : "")
      : "API do Neon não configurada",
  });

  // --- Consolidado ---
  const ok = itens.filter((i) => i.critico).every((i) => i.ok);

  // --- Incidentes automaticos (so quando o banco aceita escrita) ---
  if (dbOk) {
    // (a) Pagina /na-midia fora do ar (bug de app enquanto o banco esta de pe).
    if (naMidiaChecado) {
      if (!naMidiaOk) {
        const r = await abrirOuAtualizarAuto({
          assinatura: ASSINATURAS.NA_MIDIA_DOWN,
          titulo: 'Página "Na Mídia" fora do ar',
          severidade: "alta",
          detalhe: `A página pública /na-midia respondeu HTTP ${naMidiaStatus ?? "sem resposta"} na checagem automática.`,
          quando,
        });
        if (r === "aberto") abertos.push('Página "Na Mídia" fora do ar');
      } else {
        if (
          await resolverAuto({
            assinatura: ASSINATURAS.NA_MIDIA_DOWN,
            nota: `A página /na-midia voltou a responder (HTTP ${naMidiaStatus}).`,
            quando,
          })
        )
          resolvidos.push('Página "Na Mídia" fora do ar');
      }
    }

    // (b) Banco crescendo demais (capacidade), se houver threshold configurado.
    const limiteBytes = limiteAlertaDbBytes();
    if (limiteBytes != null && dbSizeBytes != null) {
      if (Number(dbSizeBytes) > limiteBytes) {
        const r = await abrirOuAtualizarAuto({
          assinatura: ASSINATURAS.DB_GRANDE,
          titulo: "Banco de dados crescendo (atenção de capacidade)",
          severidade: "media",
          detalhe: `O banco está com ${formatarBytes(Number(dbSizeBytes))}, acima do limite de alerta (${formatarBytes(limiteBytes)}).`,
          quando,
        });
        if (r === "aberto")
          abertos.push("Banco de dados crescendo (atenção de capacidade)");
      } else {
        if (
          await resolverAuto({
            assinatura: ASSINATURAS.DB_GRANDE,
            nota: `Tamanho atual: ${formatarBytes(Number(dbSizeBytes))}.`,
            quando,
          })
        )
          resolvidos.push("Banco de dados crescendo (atenção de capacidade)");
      }
    }

    // (c) PROATIVO: consumo de compute do Neon perto do limite -> alerta ANTES
    //     de o banco "estourar" (o que causou o INC_001).
    if (neonOk && neonPct != null) {
      const pctAlerta = limiteAlertaNeonPct();
      if (neonPct >= pctAlerta) {
        const r = await abrirOuAtualizarAuto({
          assinatura: ASSINATURAS.NEON_ALTO_CONSUMO,
          titulo: "Consumo do banco (Neon) perto do limite",
          severidade: neonPct >= 100 ? "alta" : "media",
          detalhe:
            `O consumo de compute do ciclo está em ~${neonPct}% da referência do plano ` +
            `(${formatarHoras(neon?.computeSegundos)} de ${NEON_PLANO.computeIncluidoHoras} h). ` +
            `Reveja o uso ou o plano antes de estourar.`,
          quando,
        });
        if (r === "aberto")
          abertos.push("Consumo do banco (Neon) perto do limite");
      } else {
        if (
          await resolverAuto({
            assinatura: ASSINATURAS.NEON_ALTO_CONSUMO,
            nota: `Consumo atual: ~${neonPct}% da referência.`,
            quando,
          })
        )
          resolvidos.push("Consumo do banco (Neon) perto do limite");
      }
    }
  }

  // --- Persistir a checagem (historico/tendencia). Best-effort. ---
  try {
    await prisma.sentinelaCheck.create({
      data: {
        origem,
        ok,
        dbOk,
        dbLatenciaMs: dbLatenciaMs ?? undefined,
        dbSizeBytes: dbSizeBytes ?? undefined,
        naMidiaOk: naMidiaChecado ? naMidiaOk : false,
        naMidiaStatus: naMidiaStatus ?? undefined,
        midiaCount: midiaCount ?? undefined,
        neonOk,
        neonComputeSeconds:
          neon?.computeSegundos != null
            ? Math.round(neon.computeSegundos)
            : undefined,
        neonStorageBytes:
          neon?.storageBytes != null
            ? BigInt(Math.round(neon.storageBytes))
            : undefined,
        neonPeriodEnd: neon?.periodoFim ? new Date(neon.periodoFim) : undefined,
        detalhe: JSON.stringify(itens),
      },
    });
  } catch (e) {
    // Se o banco estiver fora, nao ha onde gravar: seguimos sem quebrar.
    console.error("[sentinela] falha ao gravar SentinelaCheck:", e);
  }

  return {
    ok,
    origem,
    quando: quando.toISOString(),
    itens,
    incidentesAbertos: abertos,
    incidentesResolvidos: resolvidos,
  };
}
