"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SairButton } from "@/components/site/sair-button";
import { AvatarEditor } from "@/components/site/avatar-editor";
import { PerfilForm } from "@/components/site/perfil-form";
import { VerificarEmail } from "@/components/site/verificar-email";
import { capitalizarNome } from "@/lib/nome";
import { planoAtende } from "@/lib/planos";

type PerfilInit = React.ComponentProps<typeof PerfilForm>["init"];

type Props = {
  nome: string | null;
  email: string | null;
  plano: string;
  planoLabel: string;
  avatar: string | null;
  emailVerified: boolean;
  membroDesde: string | null;
  perfil: PerfilInit;
};

type SecaoId = "visao" | "perfil" | "plano" | "pagamento" | "seguranca";

const NAV: { id: SecaoId; label: string; icon: React.ReactNode }[] = [
  {
    id: "visao",
    label: "Visão geral",
    icon: (
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H4a1 1 0 0 1-1-1v-9.5Z" />
    ),
  },
  {
    id: "perfil",
    label: "Meu perfil",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      </>
    ),
  },
  {
    id: "plano",
    label: "Meu plano",
    icon: (
      <>
        <path d="m12 3 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9 6.7 19l1-5.8L3.5 9l5.9-.9L12 3Z" />
      </>
    ),
  },
  {
    id: "pagamento",
    label: "Pagamento",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
      </>
    ),
  },
  {
    id: "seguranca",
    label: "Segurança",
    icon: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
];

// Jornada de conteúdo: o que a pessoa acessa hoje e o que desbloqueia.
const CONTEUDOS: {
  titulo: string;
  desc: string;
  planoMin: string;
  href: string;
}[] = [
  {
    titulo: "Feed HCE",
    desc: "Artigos, referências e novidades para aprender e aplicar.",
    planoMin: "free",
    href: "/feed",
  },
  {
    titulo: "Soluções semanais para a cozinha",
    desc: "Atualizações práticas, toda semana.",
    planoMin: "essencial",
    href: "/mais-hce",
  },
  {
    titulo: "Receitas e fichas técnicas",
    desc: "Biblioteca com download em PDF.",
    planoMin: "profissional",
    href: "/mais-hce",
  },
  {
    titulo: "E-books, materiais e comunidade",
    desc: "Conteúdos aprofundados e troca com especialistas.",
    planoMin: "premium",
    href: "/mais-hce",
  },
];

function Icone({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ContaDashboard(props: Props) {
  const { nome, email, plano, planoLabel, avatar, emailVerified, membroDesde, perfil } =
    props;
  const [secao, setSecao] = useState<SecaoId>("visao");
  const nomeCap = capitalizarNome(nome) || "—";
  const primeiro = nomeCap.split(" ")[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[264px_1fr] lg:gap-8">
      {/* ---------------- Menu lateral ---------------- */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4 lg:flex-col lg:items-center lg:text-center">
            <AvatarEditor initialImage={avatar} nome={nome} size={72} />
            <div className="min-w-0">
              <p className="truncate font-display font-bold text-brand-blue">
                {nomeCap}
              </p>
              <p className="truncate text-xs text-muted">{email}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 lg:justify-center">
                <span className="inline-block rounded-full bg-brand-amber/25 px-3 py-0.5 text-xs font-semibold text-brand-amber-dark">
                  Plano {planoLabel}
                </span>
                {emailVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                      aria-hidden="true"
                    >
                      <path d="m5 12 4.5 4.5L19 7" />
                    </svg>
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <nav
          aria-label="Seções da conta"
          className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:pb-0 hce-scroll-x"
        >
          {NAV.map((item) => {
            const ativo = secao === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSecao(item.id)}
                aria-current={ativo ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-left font-display text-sm font-semibold whitespace-nowrap transition-colors lg:rounded-2xl ${
                  ativo
                    ? "bg-brand-blue text-white shadow-sm"
                    : "bg-white text-brand-blue hover:bg-surface-soft"
                }`}
              >
                <Icone>{item.icon}</Icone>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 hidden lg:block">
          <SairButton />
        </div>
      </aside>

      {/* ---------------- Conteúdo ---------------- */}
      <section className="min-w-0">
        {secao === "visao" && (
          <Painel titulo={`Olá, ${primeiro}!`} subtitulo="Esta é a sua área na HCE.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Dado rotulo="Nome" valor={nomeCap} />
              <Dado rotulo="E-mail" valor={email ?? "—"} quebrar />
              <Dado rotulo="Plano atual" valor={planoLabel} />
              <Dado rotulo="Membro desde" valor={membroDesde ?? "—"} />
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-display text-sm font-bold tracking-wide text-brand-blue uppercase">
                Seu conteúdo na HCE
              </h3>
              <p className="mt-1 text-sm text-muted">
                      Onde você está na jornada e o que dá para desbloquear.
              </p>
              <ul className="mt-4 grid gap-3">
                {CONTEUDOS.map((c) => {
                  const liberado = planoAtende(plano, c.planoMin);
                  return (
                    <li
                      key={c.titulo}
                      className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-line p-4 sm:flex-nowrap"
                    >
                      <span
                        aria-hidden
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          liberado
                            ? "bg-brand-amber/25 text-brand-amber-dark"
                            : "bg-surface-soft text-muted"
                        }`}
                      >
                        {liberado ? <Check /> : <Cadeado />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-semibold text-brand-blue">
                          {c.titulo}
                        </p>
                        <p className="text-sm text-muted">{c.desc}</p>
                      </div>
                      {liberado ? (
                        <Button
                          href={c.href}
                          size="md"
                          className="w-full shrink-0 sm:w-auto"
                        >
                          Abrir
                        </Button>
                      ) : (
                        <Button
                          href="/mais-hce"
                          size="md"
                          variant="ghost"
                          className="w-full shrink-0 border border-brand-blue/25 whitespace-nowrap sm:w-auto"
                        >
                          Com o +HCE
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </Painel>
        )}

        {secao === "perfil" && (
          <Painel
            titulo="Meu perfil"
            subtitulo="Sua foto fica no menu ao lado. Complete os dados abaixo — ficam visíveis só para a HCE."
          >
            <PerfilForm init={perfil} embutido />
          </Painel>
        )}

        {secao === "plano" && (
          <Painel titulo="Meu plano" subtitulo="Acompanhe seu acesso e evolua quando quiser.">
            <div className="rounded-2xl border border-line bg-surface-soft p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-wide text-muted uppercase">
                    Plano atual
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-brand-blue">
                    {planoLabel}
                  </p>
                </div>
                <span className="rounded-full bg-brand-amber/25 px-4 py-1.5 text-sm font-semibold text-brand-amber-dark">
                  Ativo
                </span>
              </div>

              <ul className="mt-5 grid gap-2.5">
                {(plano === "free"
                  ? [
                      "Acesso ao Feed HCE",
                      "Conteúdos e novidades abertos",
                      "Sem qualquer cobrança",
                    ]
                  : [
                      "Acesso ao Feed HCE",
                      "Conteúdos exclusivos do seu plano",
                      "Materiais e e-books liberados",
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink">
                    <Check /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {plano === "free" && (
              <div className="mt-6 rounded-2xl border border-brand-blue/15 bg-brand-blue p-6 text-white">
                <p className="font-display text-lg font-bold text-brand-amber">
                  Quer ir além?
                </p>
                <p className="mt-2 leading-relaxed text-white/90">
                  O +HCE reúne receitas, fichas técnicas, e-books e conteúdos para
                  fortalecer sua prática na cozinha e na gestão. Conheça os planos.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button href="/mais-hce" size="md">
                    Ver planos do +HCE
                  </Button>
                </div>
              </div>
            )}
          </Painel>
        )}

        {secao === "pagamento" && (
          <Painel titulo="Pagamento" subtitulo="Assinaturas e cobranças ficarão aqui.">
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-surface-soft px-6 py-12 text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-amber/25 text-brand-amber-dark">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7"
                  aria-hidden="true"
                >
                  <path d="M14.7 6.3a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8l-8.4 8.4-3.5.7.7-3.5 8.2-8.6Z" />
                  <path d="M12 21h8" />
                </svg>
              </span>
              <span className="mt-4 rounded-full bg-brand-amber/25 px-3 py-1 text-xs font-semibold text-brand-amber-dark uppercase">
                Em construção
              </span>
              <p className="mt-4 max-w-md leading-relaxed text-muted">
                {plano === "free" ? (
                  <>
                    Você está no plano <strong className="text-ink">Gratuito</strong>{" "}
                    — não há nenhuma cobrança. Quando os planos pagos do +HCE forem
                    lançados, você poderá assinar e gerenciar seus pagamentos por aqui.
                  </>
                ) : (
                  <>
                    A gestão de pagamentos e faturas do seu plano estará disponível
                    em breve nesta área.
                  </>
                )}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href="/mais-hce" size="md" variant="blue">
                  Conhecer o +HCE
                </Button>
                <Button
                  href="/avise-me"
                  size="md"
                  variant="ghost"
                  className="border border-brand-blue/25"
                >
                  Quero ser avisado
                </Button>
              </div>
            </div>
          </Painel>
        )}

        {secao === "seguranca" && (
          <Painel titulo="Segurança" subtitulo="Cuide do acesso à sua conta.">
            <div className="grid gap-4">
              <Dado rotulo="E-mail de acesso" valor={email ?? "—"} quebrar />
              <VerificarEmail email={email} emailVerified={emailVerified} />
              <div className="rounded-2xl border border-line bg-surface-soft p-5">
                <p className="font-display font-semibold text-brand-blue">
                  Senha
                </p>
                <p className="mt-1 text-sm text-muted">
                  Para trocar sua senha, enviamos um link seguro para o seu e-mail.
                </p>
                <div className="mt-4">
                  <Button
                    href="/esqueci-senha"
                    size="md"
                    variant="ghost"
                    className="border border-brand-blue/25"
                  >
                    Alterar minha senha
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-6 lg:hidden">
              <SairButton />
            </div>
          </Painel>
        )}

        {/* Sair sempre acessível no mobile */}
        <div className="mt-6 lg:hidden">
          {secao !== "seguranca" && <SairButton />}
        </div>
      </section>
    </div>
  );
}

function Painel({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-display text-2xl font-bold text-brand-blue sm:text-3xl">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="mt-1.5 leading-relaxed text-muted">{subtitulo}</p>
      )}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Dado({
  rotulo,
  valor,
  quebrar,
}: {
  rotulo: string;
  valor: string;
  quebrar?: boolean;
}) {
  return (
    <div>
      <p className="text-xs tracking-wide text-muted uppercase">{rotulo}</p>
      <p className={`mt-1 font-medium text-ink ${quebrar ? "break-all" : ""}`}>
        {valor}
      </p>
    </div>
  );
}

function Cadeado() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0 text-brand-amber-dark"
      aria-hidden="true"
    >
      <path d="m5 12 4.5 4.5L19 7" />
    </svg>
  );
}
