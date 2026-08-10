"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { analyticsPermitido, CONSENT_EVENT } from "@/lib/consent";

// Dispara um "beacon" leve para /api/track a cada navegacao publica (RAF_013).
// Usa navigator.sendBeacon quando disponivel (nao atrasa a pagina) e cai para
// fetch keepalive. Nunca rastreia a area /adm.
//
// LGPD: so registra se a pessoa CONSENTIU com estatisticas (opt-in). Se ela
// aceitar depois, o ouvinte de CONSENT_EVENT registra a pagina atual na hora.
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/adm")) return;

    const enviar = () => {
      if (!analyticsPermitido()) return;

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
    };

    enviar();
    window.addEventListener(CONSENT_EVENT, enviar);
    return () => window.removeEventListener(CONSENT_EVENT, enviar);
  }, [pathname]);

  return null;
}
