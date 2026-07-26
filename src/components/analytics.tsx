"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Dispara um "beacon" leve para /api/track a cada navegacao publica (RAF_013).
// Usa navigator.sendBeacon quando disponivel (nao atrasa a pagina) e cai para
// fetch keepalive. Nunca rastreia a area /adm.
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/adm")) return;

    const payload = JSON.stringify({ path: pathname });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon?.("/api/track", blob)) return;
    } catch {
      // segue para o fallback
    }

    fetch("/api/track", {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
