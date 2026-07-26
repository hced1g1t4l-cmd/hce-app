"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriePonto } from "@/lib/analytics";

const AZUL = "#003288";
const AMBAR = "#e8a200";

// Grafico de acessos ao longo do tempo (RAF_013): acessos totais x usuarios unicos.
export function AcessosChart({ data }: { data: SeriePonto[] }) {
  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-line text-sm text-muted">
        Sem acessos registrados neste período ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AZUL} stopOpacity={0.28} />
            <stop offset="100%" stopColor={AZUL} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradUnicos" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={AMBAR} stopOpacity={0.3} />
            <stop offset="100%" stopColor={AMBAR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef1f5" vertical={false} />
        <XAxis
          dataKey="rotulo"
          tick={{ fontSize: 12, fill: "#667085" }}
          tickLine={false}
          axisLine={{ stroke: "#e5e9f0" }}
          minTickGap={16}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#667085" }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e5e9f0",
            fontSize: 13,
          }}
          labelStyle={{ fontWeight: 600, color: "#003288" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 13, paddingTop: 8 }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="total"
          name="Acessos totais"
          stroke={AZUL}
          strokeWidth={2.5}
          fill="url(#gradTotal)"
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Area
          type="monotone"
          dataKey="unicos"
          name="Usuários únicos"
          stroke={AMBAR}
          strokeWidth={2.5}
          fill="url(#gradUnicos)"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
