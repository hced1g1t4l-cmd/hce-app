"use client";

import { useEffect, useRef } from "react";

// Mede o tempo de permanencia na pagina do Feed/artigo e envia para
// /api/feed/track (BAC_109). Conta apenas o tempo com a aba visivel; envia
// no primeiro "hidden"/"pagehide" e ao desmontar (navegacao SPA).
export function FeedTracker({ viewId }: { viewId: string }) {
  const acumulado = useRef(0);
  const inicio = useRef<number | null>(null);

  useEffect(() => {
    inicio.current =
      document.visibilityState === "visible" ? Date.now() : null;

    function fecharJanela() {
      if (inicio.current != null) {
        acumulado.current += Date.now() - inicio.current;
        inicio.current = null;
      }
    }

    function enviar() {
      fecharJanela();
      const dur = acumulado.current;
      if (dur < 1000) return; // ignora aberturas relâmpago
      const payload = JSON.stringify({ id: viewId, durationMs: dur });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            "/api/feed/track",
            new Blob([payload], { type: "application/json" }),
          );
        } else {
          void fetch("/api/feed/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          });
        }
      } catch {
        // beacon é best-effort; ignora falhas
      }
    }

    function onVisibilidade() {
      if (document.visibilityState === "hidden") enviar();
      else inicio.current = Date.now();
    }

    document.addEventListener("visibilitychange", onVisibilidade);
    window.addEventListener("pagehide", enviar);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilidade);
      window.removeEventListener("pagehide", enviar);
      enviar();
    };
  }, [viewId]);

  return null;
}
