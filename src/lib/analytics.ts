import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// Agregacoes do painel de acessos (RAF_013). Tudo calculado no Postgres (Neon)
// com fuso America/Sao_Paulo para as series por dia/hora.

export type Periodo = "total" | "60d" | "30d" | "7d" | "24h";

export const PERIODOS: { id: Periodo; label: string }[] = [
  { id: "total", label: "Total" },
  { id: "60d", label: "Últimos 60 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "7d", label: "Última semana" },
  { id: "24h", label: "Últimas 24 horas" },
];

export function parsePeriodo(value?: string): Periodo {
  return PERIODOS.some((p) => p.id === value) ? (value as Periodo) : "total";
}

export function periodoStart(p: Periodo): Date | null {
  const now = Date.now();
  const DAY = 86_400_000;
  switch (p) {
    case "24h":
      return new Date(now - DAY);
    case "7d":
      return new Date(now - 7 * DAY);
    case "30d":
      return new Date(now - 30 * DAY);
    case "60d":
      return new Date(now - 60 * DAY);
    default:
      return null;
  }
}

function whereFrom(start: Date | null): Prisma.Sql {
  return start ? Prisma.sql`WHERE "createdAt" >= ${start}` : Prisma.empty;
}

export type SeriePonto = { rotulo: string; total: number; unicos: number };

// Serie temporal: por hora quando o periodo e 24h, por dia caso contrario.
export async function getSerie(periodo: Periodo): Promise<SeriePonto[]> {
  const start = periodoStart(periodo);
  const porHora = periodo === "24h";
  const bucket = porHora ? "hour" : "day";
  const fmt = porHora ? "DD/MM HH24:00" : "DD/MM";

  const rows = await prisma.$queryRaw<
    { rotulo: string; total: number; unicos: number }[]
  >(Prisma.sql`
    SELECT
      to_char(date_trunc(${bucket}, "createdAt" AT TIME ZONE 'America/Sao_Paulo'), ${fmt}) AS rotulo,
      count(*)::int AS total,
      count(DISTINCT "visitorId")::int AS unicos
    FROM "PageView"
    ${whereFrom(start)}
    GROUP BY 1, date_trunc(${bucket}, "createdAt" AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY date_trunc(${bucket}, "createdAt" AT TIME ZONE 'America/Sao_Paulo')
  `);

  return rows;
}

export type Totais = { total: number; unicos: number };

export async function getTotais(periodo: Periodo): Promise<Totais> {
  const start = periodoStart(periodo);
  const rows = await prisma.$queryRaw<Totais[]>(Prisma.sql`
    SELECT count(*)::int AS total, count(DISTINCT "visitorId")::int AS unicos
    FROM "PageView"
    ${whereFrom(start)}
  `);
  return rows[0] ?? { total: 0, unicos: 0 };
}

export type CidadePonto = {
  city: string;
  country: string | null;
  lat: number;
  lng: number;
  total: number;
  unicos: number;
};

export async function getCidades(periodo: Periodo): Promise<CidadePonto[]> {
  const start = periodoStart(periodo);
  const cond = start
    ? Prisma.sql`AND "createdAt" >= ${start}`
    : Prisma.empty;

  const rows = await prisma.$queryRaw<CidadePonto[]>(Prisma.sql`
    SELECT
      "city",
      max("country") AS country,
      avg("lat")::float AS lat,
      avg("lng")::float AS lng,
      count(*)::int AS total,
      count(DISTINCT "visitorId")::int AS unicos
    FROM "PageView"
    WHERE "city" IS NOT NULL AND "lat" IS NOT NULL AND "lng" IS NOT NULL ${cond}
    GROUP BY "city"
    ORDER BY total DESC
    LIMIT 500
  `);
  return rows;
}
