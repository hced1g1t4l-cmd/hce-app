"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// reCAPTCHA v2 com renderização EXPLÍCITA. Isso resolve o bug em que, ao navegar
// entre páginas (SPA), o api.js já rodou o auto-render e o widget não aparecia —
// e aí grecaptcha.getResponse() lançava "No reCAPTCHA clients exist", fazendo o
// botão "não funcionar". Aqui nós mesmos renderizamos o widget quando o
// componente monta e expomos getToken()/reset() por ref.

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SRC = "https://www.google.com/recaptcha/api.js?render=explicit";

type Grecaptcha = {
  render: (el: HTMLElement, opts: { sitekey: string }) => number;
  getResponse: (id?: number) => string;
  reset: (id?: number) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

export type RecaptchaHandle = {
  getToken: () => string;
  reset: () => void;
  habilitado: boolean;
};

function carregarScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    if (window.grecaptcha?.render) return resolve();
    const existente = document.querySelector<HTMLScriptElement>(
      "script[data-recaptcha]",
    );
    if (existente) {
      existente.addEventListener("load", () => resolve(), { once: true });
      if (window.grecaptcha?.render) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.dataset.recaptcha = "1";
    s.addEventListener("load", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
}

export const Recaptcha = forwardRef<RecaptchaHandle>(function Recaptcha(
  _props,
  ref,
) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    habilitado: Boolean(SITE_KEY),
    getToken: () => {
      if (!SITE_KEY) return "";
      try {
        return window.grecaptcha?.getResponse(widgetId.current ?? undefined) ?? "";
      } catch {
        return "";
      }
    },
    reset: () => {
      try {
        if (widgetId.current != null) window.grecaptcha?.reset(widgetId.current);
      } catch {
        // ignora
      }
    },
  }));

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelado = false;
    carregarScript().then(() => {
      const tentar = () => {
        if (cancelado) return;
        const g = window.grecaptcha;
        if (g?.render && boxRef.current && widgetId.current == null) {
          try {
            widgetId.current = g.render(boxRef.current, { sitekey: SITE_KEY });
          } catch {
            // já renderizado ou indisponível
          }
        } else if (widgetId.current == null) {
          setTimeout(tentar, 150);
        }
      };
      tentar();
    });
    return () => {
      cancelado = true;
    };
  }, []);

  if (!SITE_KEY) return null;
  return (
    <div className="mt-6 flex justify-center">
      <div ref={boxRef} />
    </div>
  );
});
