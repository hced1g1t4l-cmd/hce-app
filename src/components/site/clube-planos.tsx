"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// Clube +HCE — planos e checkout (BAC_143, Fase 2).
// O botao dos planos pagos abre um modal de checkout que fala com
// POST /api/pagamento/checkout: cria a assinatura no Asaas e devolve o meio de
// pagamento (QR Pix copia-e-cola ou a fatura hospedada para cartao).
// O plano gratuito leva direto ao cadastro.

type PlanoId = "gratuito" | "essencial" | "profissional";

type Plano = {
  id: PlanoId;
  nome: string;
  foco: string;
  precoAnual: string | null; // por mes no plano anual
  precoAvulso: string | null; // avulso por mes
  itens: string[];
  cta: string;
  destaque?: boolean;
};

const PLANOS: Plano[] = [
  {
    id: "gratuito",
    nome: "Gratuito",
    foco: "Para começar",
    precoAnual: null,
    precoAvulso: null,
    itens: [
      "Feed HCE: artigos e conteúdos exclusivos e novidades",
      "Feed HCE: Referências para aprender e aplicar",
    ],
    cta: "Quero começar",
  },
  {
    id: "essencial",
    nome: "Básico",
    foco: "Para o dia a dia",
    precoAnual: "29,90",
    precoAvulso: "34,90",
    itens: [
      "Todos os recursos da versão gratuita",
      "Pílulas e dicas de cozinha",
      "Organização da casa e da geladeira",
      "Banco de receitas",
      "Ebooks",
      "Técnica, história e cultura gastronômica em nível leve",
    ],
    cta: "Assinar Básico",
  },
  {
    id: "profissional",
    nome: "Profissional",
    foco: "Para aplicar",
    precoAnual: "59,90",
    precoAvulso: "64,90",
    itens: [
      "Tudo do Básico",
      "Biblioteca de Receitas (novas todo mês)",
      "Download das fichas e receitas em PDF",
    ],
    cta: "Assinar Profissional",
  },
];

const ctaBase =
  "mt-8 inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-center font-display text-sm font-semibold leading-snug shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none sm:text-base";

type Ciclo = "anual" | "avulso";
type Metodo = "PIX" | "CREDIT_CARD";

type PixResult = {
  imagemBase64: string;
  copiaECola: string;
  expiraEm: string | null;
};

function formatarCpf(v: string): string {
  const d = v.replace(/\D+/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function ClubePlanos() {
  const router = useRouter();
  const pathname = usePathname();

  const [aberto, setAberto] = useState<Plano | null>(null);
  const [ciclo, setCiclo] = useState<Ciclo>("anual");
  const [metodo, setMetodo] = useState<Metodo>("PIX");
  const [cpf, setCpf] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pix, setPix] = useState<PixResult | null>(null);
  const [copiado, setCopiado] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  function abrir(plano: Plano) {
    if (typeof document !== "undefined") {
      lastFocus.current = document.activeElement as HTMLElement;
    }
    setAberto(plano);
    setCiclo("anual");
    setMetodo("PIX");
    setCpf("");
    setErro(null);
    setPix(null);
    setCopiado(false);
  }

  function fechar() {
    setAberto(null);
  }

  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [aberto]);

  const preco =
    aberto && ciclo === "anual" ? aberto.precoAnual : aberto?.precoAvulso;

  async function assinar() {
    if (!aberto) return;
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/pagamento/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plano: aberto.id,
          ciclo,
          metodo,
          cpfCnpj: cpf.replace(/\D+/g, ""),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        const next = encodeURIComponent(pathname || "/");
        router.push(`/entrar?next=${next}`);
        return;
      }
      if (!res.ok) {
        setErro(data?.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }

      if (metodo === "PIX" && data.pix) {
        setPix(data.pix as PixResult);
        return;
      }
      if (data.invoiceUrl) {
        window.location.href = data.invoiceUrl as string;
        return;
      }
      setErro("Pagamento iniciado, mas não recebemos o meio de pagamento.");
    } catch {
      setErro("Falha de conexão. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiarPix() {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copiaECola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponivel: usuario copia manualmente */
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLANOS.map((p) => (
          <article
            key={p.id}
            className={cn(
              "reveal relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl motion-reduce:transform-none motion-reduce:transition-none @container",
              p.destaque
                ? "border-brand-amber ring-2 ring-brand-amber/60"
                : "border-line hover:border-brand-amber",
            )}
          >
            {p.destaque && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-amber px-4 py-1 text-center font-display text-xs font-bold tracking-wide text-brand-blue-deep uppercase">
                Mais completo
              </span>
            )}

            <span className="font-display text-xs font-semibold tracking-widest text-brand-amber-dark uppercase">
              {p.foco}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-brand-blue">
              {p.nome}
            </h3>

            <div className="mt-5 min-h-[76px]">
              {p.precoAnual ? (
                <>
                  <p className="flex flex-nowrap items-baseline gap-1">
                    <span
                      className="font-display leading-none font-extrabold whitespace-nowrap text-brand-blue"
                      style={{
                        fontSize: "clamp(1.375rem, 11cqi, 2.25rem)",
                      }}
                    >
                      {"R$\u00A0" + p.precoAnual}
                    </span>
                    <span className="text-sm font-medium whitespace-nowrap text-muted">
                      /mês
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    no plano anual · ou R$ {p.precoAvulso} avulso
                  </p>
                </>
              ) : (
                <>
                  <p
                    className="font-display leading-none font-extrabold whitespace-nowrap text-brand-blue"
                    style={{ fontSize: "clamp(1.375rem, 11cqi, 2.25rem)" }}
                  >
                    Grátis
                  </p>
                  <p className="mt-1 text-sm text-muted">sem cartão de crédito</p>
                </>
              )}
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-ink">
              {p.itens.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-amber text-xs font-bold text-brand-blue-deep"
                  >
                    ✓
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>

            {p.id === "gratuito" ? (
              <a
                href="/criar-conta"
                className={cn(
                  ctaBase,
                  "bg-brand-blue text-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep",
                )}
              >
                {p.cta}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => abrir(p)}
                className={cn(
                  ctaBase,
                  p.destaque
                    ? "bg-brand-amber text-brand-blue-deep hover:bg-brand-amber-dark"
                    : "bg-brand-blue text-brand-amber hover:bg-brand-amber hover:text-brand-blue-deep",
                )}
              >
                {p.cta}
              </button>
            )}
          </article>
        ))}
      </div>

      {aberto && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          onClick={fechar}
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-brand-blue-deep/70 backdrop-blur-sm"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="clube-checkout-title"
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-line bg-white p-7 shadow-2xl"
          >
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-soft hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
            >
              <span aria-hidden className="text-xl leading-none">
                ×
              </span>
            </button>

            {pix ? (
              // ----- Tela do Pix -----
              <div className="text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-amber-soft px-3 py-1 font-display text-xs font-bold tracking-wide text-brand-amber-dark uppercase">
                  Pague com Pix
                </span>
                <h2
                  id="clube-checkout-title"
                  className="mt-4 font-display text-xl font-bold text-brand-blue"
                >
                  Escaneie para ativar o {aberto.nome}
                </h2>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${pix.imagemBase64}`}
                  alt="QR Code Pix"
                  className="mx-auto mt-4 h-56 w-56 rounded-xl border border-line"
                  width={224}
                  height={224}
                />
                <button
                  type="button"
                  onClick={copiarPix}
                  className="mt-4 w-full rounded-xl border border-line bg-surface-soft px-4 py-3 text-left text-xs break-all text-ink transition-colors hover:border-brand-amber"
                >
                  <span className="mb-1 block font-semibold text-brand-blue">
                    {copiado ? "Copiado! ✓" : "Toque para copiar o código"}
                  </span>
                  {pix.copiaECola}
                </button>
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  Após o pagamento, seu acesso é liberado automaticamente. Pode
                  fechar esta janela — avisaremos por e-mail.
                </p>
                <Button href="/conta" size="lg" className="mt-5 w-full">
                  Ir para minha conta
                </Button>
              </div>
            ) : (
              // ----- Formulario de checkout -----
              <div>
                <span className="font-display text-xs font-semibold tracking-widest text-brand-amber-dark uppercase">
                  Assinar
                </span>
                <h2
                  id="clube-checkout-title"
                  className="mt-1 font-display text-2xl font-bold text-brand-blue"
                >
                  {aberto.nome}
                </h2>

                {/* Ciclo */}
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {(["anual", "avulso"] as Ciclo[]).map((c) => {
                    const val =
                      c === "anual" ? aberto.precoAnual : aberto.precoAvulso;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCiclo(c)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-colors",
                          ciclo === c
                            ? "border-brand-amber bg-brand-amber-soft"
                            : "border-line hover:border-brand-amber",
                        )}
                      >
                        <span className="block font-display text-sm font-bold text-brand-blue">
                          {c === "anual" ? "Anual" : "Mensal"}
                        </span>
                        <span className="block text-xs text-muted">
                          R$ {val}
                          {c === "anual" ? "/mês" : " avulso"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Metodo */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(
                    [
                      ["PIX", "Pix"],
                      ["CREDIT_CARD", "Cartão"],
                    ] as [Metodo, string][]
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMetodo(m)}
                      className={cn(
                        "rounded-xl border p-3 text-center font-display text-sm font-semibold transition-colors",
                        metodo === m
                          ? "border-brand-amber bg-brand-amber-soft text-brand-blue"
                          : "border-line text-ink hover:border-brand-amber",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* CPF */}
                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-medium text-ink">
                    CPF do titular
                  </span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    value={cpf}
                    onChange={(e) => setCpf(formatarCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-line px-4 py-3 text-ink outline-none focus:border-brand-amber focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-amber"
                  />
                  <span className="mt-1 block text-xs text-muted">
                    Necessário para a nota fiscal.
                  </span>
                </label>

                {erro && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {erro}
                  </p>
                )}

                <button
                  type="button"
                  onClick={assinar}
                  disabled={carregando || cpf.replace(/\D+/g, "").length < 11}
                  className={cn(
                    ctaBase,
                    "bg-brand-amber text-brand-blue-deep hover:bg-brand-amber-dark disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                >
                  {carregando
                    ? "Processando…"
                    : metodo === "PIX"
                      ? `Gerar Pix · R$ ${preco}`
                      : `Continuar · R$ ${preco}`}
                </button>
                <p className="mt-3 text-center text-xs text-muted">
                  Cobrança recorrente mensal · cancele quando quiser.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
