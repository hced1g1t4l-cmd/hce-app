"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoNaturalEarth1, geoPath } from "d3-geo";
import type { GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { FeatureCollection, Geometry } from "geojson";
import type { CidadePonto } from "@/lib/analytics";

type Vista = "brasil" | "mundo";

const W = 820;
const H = 480;

// Mapa de bolhas proporcionais aos acessos por cidade (RAF_013).
// Brasil usa projecao Mercator ajustada ao pais; Mundo usa Natural Earth.
export function AcessosMapa({ cidades }: { cidades: CidadePonto[] }) {
  const [vista, setVista] = useState<Vista>("brasil");
  const [geo, setGeo] = useState<FeatureCollection<Geometry> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [hover, setHover] = useState<
    { c: CidadePonto; x: number; y: number } | null
  >(null);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    setGeo(null);

    const url =
      vista === "brasil" ? "/maps/brazil-states.json" : "/maps/world-110m.json";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (!vivo) return;
        if (data.type === "Topology") {
          const obj = data.objects.countries ?? Object.values(data.objects)[0];
          setGeo(
            feature(data, obj) as unknown as FeatureCollection<Geometry>,
          );
        } else {
          setGeo(data as FeatureCollection<Geometry>);
        }
      })
      .catch(() => vivo && setGeo(null))
      .finally(() => vivo && setCarregando(false));

    return () => {
      vivo = false;
    };
  }, [vista]);

  const pontos = useMemo(
    () =>
      vista === "brasil"
        ? cidades.filter((c) => c.country === "BR")
        : cidades,
    [cidades, vista],
  );

  const projecao: GeoProjection | null = useMemo(() => {
    if (!geo) return null;
    const proj = vista === "brasil" ? geoMercator() : geoNaturalEarth1();
    proj.fitSize([W, H], geo);
    return proj;
  }, [geo, vista]);

  const pathGen = useMemo(
    () => (projecao ? geoPath(projecao) : null),
    [projecao],
  );

  const maxTotal = useMemo(
    () => Math.max(1, ...pontos.map((p) => p.total)),
    [pontos],
  );

  const raio = (total: number) => {
    const min = 4;
    const max = 30;
    return min + (max - min) * Math.sqrt(total / maxTotal);
  };

  const bolhas = useMemo(() => {
    if (!projecao) return [];
    return pontos
      .map((c) => {
        const xy = projecao([c.lng, c.lat]);
        return xy ? { c, x: xy[0], y: xy[1] } : null;
      })
      .filter((b): b is { c: CidadePonto; x: number; y: number } => b !== null)
      // maiores por baixo para nao cobrir as menores
      .sort((a, b) => b.c.total - a.c.total);
  }, [pontos, projecao]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Área do mapa"
          className="inline-flex rounded-full border border-line bg-surface-soft p-1"
        >
          <BotaoVista
            ativo={vista === "brasil"}
            onClick={() => setVista("brasil")}
          >
            Brasil
          </BotaoVista>
          <BotaoVista
            ativo={vista === "mundo"}
            onClick={() => setVista("mundo")}
          >
            Mundo
          </BotaoVista>
        </div>
        <span className="text-sm text-muted">
          {pontos.length} {pontos.length === 1 ? "cidade" : "cidades"}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-line bg-[#f5f8fc]">
        {carregando && (
          <div className="flex h-80 items-center justify-center text-sm text-muted">
            Carregando mapa…
          </div>
        )}

        {!carregando && pathGen && geo && (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Distribuição de acessos por cidade — ${
              vista === "brasil" ? "Brasil" : "Mundo"
            }`}
            onMouseLeave={() => setHover(null)}
          >
            <g>
              {geo.features.map((f, i) => (
                <path
                  key={i}
                  d={pathGen(f) ?? undefined}
                  fill="#e6ecf5"
                  stroke="#cbd5e6"
                  strokeWidth={0.5}
                />
              ))}
            </g>
            <g>
              {bolhas.map((b, i) => (
                <circle
                  key={`${b.c.city}-${i}`}
                  cx={b.x}
                  cy={b.y}
                  r={raio(b.c.total)}
                  fill="#ffc027"
                  fillOpacity={0.55}
                  stroke="#e8a200"
                  strokeWidth={1}
                  className="cursor-pointer"
                  onMouseEnter={() => setHover({ c: b.c, x: b.x, y: b.y })}
                >
                  <title>{`${b.c.city}: ${b.c.total} acessos · ${b.c.unicos} únicos`}</title>
                </circle>
              ))}
            </g>
          </svg>
        )}

        {!carregando && bolhas.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm text-muted shadow-sm">
              Nenhuma cidade com localização neste período.
            </span>
          </div>
        )}

        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-brand-blue px-3 py-2 text-xs font-medium text-white shadow-lg"
            style={{
              left: `${(hover.x / W) * 100}%`,
              top: `${(hover.y / H) * 100}%`,
            }}
          >
            <div className="font-semibold">{hover.c.city}</div>
            <div className="text-white/80">
              {hover.c.total} acessos · {hover.c.unicos} únicos
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 flex items-center gap-2 text-xs text-muted">
        <span
          aria-hidden
          className="inline-block h-3 w-3 rounded-full bg-brand-amber/60 ring-1 ring-brand-amber-dark"
        />
        Tamanho da bolha proporcional ao total de acessos da cidade.
      </p>
    </div>
  );
}

function BotaoVista({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors " +
        (ativo
          ? "bg-brand-blue text-white"
          : "text-brand-blue hover:bg-white")
      }
    >
      {children}
    </button>
  );
}
