"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const TURNSTILE_SITE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const RECAPTCHA_SITE = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const SITE_KEY = TURNSTILE_SITE || RECAPTCHA_SITE;
const USE_TURNSTILE = Boolean(TURNSTILE_SITE);

const RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?render=explicit";
const TURNSTILE_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type Grecaptcha = {
  render: (el: HTMLElement, opts: { sitekey: string }) => number;
  getResponse: (id?: number) => string;
  reset: (id?: number) => void;
};

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      "response-field"?: boolean;
      "response-field-name"?: string;
    },
  ) => string;
  getResponse: (id: string) => string;
  reset: (id: string) => void;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
    turnstile?: TurnstileApi;
  }
}

export type RecaptchaHandle = {
  getToken: () => string;
  reset: () => void;
  habilitado: boolean;
};

function carregarScript(src: string, marker: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const existente = document.querySelector<HTMLScriptElement>(
      `script[data-captcha="${marker}"]`,
    );
    if (existente) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.dataset.captcha = marker;
    s.addEventListener("load", () => resolve(), { once: true });
    document.head.appendChild(s);
  });
}

export const Recaptcha = forwardRef<RecaptchaHandle>(function Recaptcha(
  _props,
  ref,
) {
  const boxRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | string | null>(null);

  useImperativeHandle(ref, () => ({
    habilitado: Boolean(SITE_KEY),
    getToken: () => {
      if (!SITE_KEY) return "";
      try {
        if (USE_TURNSTILE && typeof widgetId.current === "string") {
          return window.turnstile?.getResponse(widgetId.current) ?? "";
        }
        if (typeof widgetId.current === "number") {
          return (
            window.grecaptcha?.getResponse(widgetId.current) ?? ""
          );
        }
        const hid = document.querySelector<HTMLInputElement>(
          'input[name="cf-turnstile-response"]',
        );
        return hid?.value ?? "";
      } catch {
        return "";
      }
    },
    reset: () => {
      try {
        if (USE_TURNSTILE && typeof widgetId.current === "string") {
          window.turnstile?.reset(widgetId.current);
        } else if (typeof widgetId.current === "number") {
          window.grecaptcha?.reset(widgetId.current);
        }
      } catch {
        // ignora
      }
    },
  }));

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelado = false;
    const src = USE_TURNSTILE ? TURNSTILE_SRC : RECAPTCHA_SRC;
    const marker = USE_TURNSTILE ? "turnstile" : "recaptcha";
    carregarScript(src, marker).then(() => {
      const tentar = () => {
        if (cancelado || !boxRef.current || widgetId.current != null) return;
        if (USE_TURNSTILE && window.turnstile?.render) {
          try {
            widgetId.current = window.turnstile.render(boxRef.current, {
              sitekey: SITE_KEY,
              "response-field": true,
              "response-field-name": "cf-turnstile-response",
            });
          } catch {
            // já renderizado
          }
          return;
        }
        if (!USE_TURNSTILE && window.grecaptcha?.render) {
          try {
            widgetId.current = window.grecaptcha.render(boxRef.current, {
              sitekey: SITE_KEY,
            });
          } catch {
            // já renderizado
          }
          return;
        }
        setTimeout(tentar, 150);
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
