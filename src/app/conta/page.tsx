import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/site/container";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ContaDashboard } from "@/components/site/conta-dashboard";
import { getSessionUser } from "@/lib/auth-user";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Minha conta · HCE",
  robots: { index: false, follow: false },
};

const PLANO_LABEL: Record<string, string> = {
  free: "Gratuito",
  essencial: "Básico",
  profissional: "Profissional",
  premium: "Premium",
};

export default async function ContaPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar?redirect=/conta");
  // E-mail obrigatoriamente confirmado para usar a conta.
  if (!user.emailVerificado) redirect("/verificar-email?apos=/conta");

  const perfil = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      image: true,
      createdAt: true,
      emailVerified: true,
      statusAssinatura: true,
      bio: true,
      handle: true,
      telefone: true,
      cep: true,
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cidade: true,
      estado: true,
      pais: true,
      linkedin: true,
      instagram: true,
      facebook: true,
    },
  });

  const membroDesde = perfil?.createdAt
    ? new Intl.DateTimeFormat("pt-BR", {
        month: "long",
        year: "numeric",
      }).format(perfil.createdAt)
    : null;

  // Assinatura mais recente + histórico de cobranças (área do assinante, Fase 5).
  const [assinaturaDb, pagamentosDb] = await Promise.all([
    prisma.assinatura.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.pagamento.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const brl = (c: number | null | undefined) =>
    typeof c === "number"
      ? (c / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      : "—";
  const dataFmt = (d: Date | null | undefined) =>
    d ? new Intl.DateTimeFormat("pt-BR").format(d) : "—";
  const metodoLabel = (m: string | null) =>
    m === "PIX"
      ? "Pix"
      : m === "CREDIT_CARD"
        ? "Cartão"
        : m === "BOLETO"
          ? "Boleto"
          : (m ?? "—");
  const statusPagLabel = (s: string) =>
    (
      ({
        PENDING: "Pendente",
        CONFIRMED: "Confirmado",
        RECEIVED: "Recebido",
        RECEIVED_IN_CASH: "Recebido",
        OVERDUE: "Vencido",
        REFUNDED: "Estornado",
        REFUND_IN_PROGRESS: "Estorno em andamento",
      }) as Record<string, string>
    )[s] ?? s;

  const assinatura = assinaturaDb
    ? {
        plano: assinaturaDb.plano,
        planoLabel: PLANO_LABEL[assinaturaDb.plano] ?? assinaturaDb.plano,
        status: assinaturaDb.status,
        metodoLabel: metodoLabel(assinaturaDb.metodo),
        valor: brl(assinaturaDb.valorCentavos),
        proximaCobranca: dataFmt(assinaturaDb.fimPeriodoAtual),
      }
    : null;

  const pagamentos = pagamentosDb.map((p) => ({
    data: dataFmt(p.pagoEm ?? p.createdAt),
    valor: brl(p.valorCentavos),
    metodo: metodoLabel(p.metodo),
    status: statusPagLabel(p.status),
  }));

  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex-1 bg-surface-soft py-12 sm:py-16">
        <Container className="max-w-5xl">
          <ContaDashboard
            nome={user.nome}
            email={user.email}
            plano={user.plano}
            planoLabel={PLANO_LABEL[user.plano] ?? "Gratuito"}
            avatar={perfil?.image ?? null}
            emailVerified={Boolean(perfil?.emailVerified)}
            membroDesde={membroDesde}
            statusAssinatura={perfil?.statusAssinatura ?? "nenhuma"}
            assinatura={assinatura}
            pagamentos={pagamentos}
            perfil={{
              bio: perfil?.bio ?? "",
              handle: perfil?.handle ?? "",
              telefone: perfil?.telefone ?? "",
              cep: perfil?.cep ?? "",
              logradouro: perfil?.logradouro ?? "",
              numero: perfil?.numero ?? "",
              complemento: perfil?.complemento ?? "",
              bairro: perfil?.bairro ?? "",
              cidade: perfil?.cidade ?? "",
              estado: perfil?.estado ?? "",
              pais: perfil?.pais ?? "",
              linkedin: perfil?.linkedin ?? "",
              instagram: perfil?.instagram ?? "",
              facebook: perfil?.facebook ?? "",
            }}
          />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
