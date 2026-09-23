// Seed do primeiro incidente (INC_001). Idempotente: só cria se ainda não
// existir um incidente com este título. Rode DEPOIS que o banco (Neon) voltar:
//   node scripts/seed-incidente-001.mjs
import pkg from "@next/env";
const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

const TITULO = 'Site "Na Mídia" fora do ar';

const DETALHAMENTO = `▶️ O que aconteceu?
Algumas páginas do site (como "Na Mídia" e a área de conta) ficaram fora do ar nos últimos dias (desde o dia 18/SET).

▶️ Por que aconteceu?
- O site guarda todo o conteúdo e os cadastros num "banco de dados".
- Esse banco de dados fica hospedado num serviço chamado Neon. É uma empresa especializada que mantém o banco no ar para nós, na nuvem (a gente não precisa ter servidor próprio).
- Estávamos usando o Neon no plano gratuito, que tem um limite mensal de uso.
- Esse limite se esgotou e, quando isso acontece, o Neon "desliga" o banco — aí as páginas que dependem dele param de abrir.
- Importante: não perdemos nada. Todos os dados estão salvos e intactos.

▶️ O que eu já fiz
- Deixei o site mais resistente: mesmo se o banco cair de novo, as páginas não quebram mais. Continuam abrindo (só ficam sem o conteúdo até o banco voltar).
- Coloquei um aviso amigável no lugar da tela de erro.
- Identifiquei a causa exata e o caminho para resolver.

▶️ O que precisamos fazer agora
- Subir o Neon (nosso banco de dados) do plano gratuito para o plano pago.
- É o que devolve o site ao ar na hora e evita que isso se repita todo mês.

▶️ Onde um cartão de crédito precisa ser usado
- O cartão é cadastrado direto no site do Neon (neon.tech), na conta do nosso projeto. É lá que se contrata o plano pago e a cobrança mensal acontece.
- É uma assinatura mensal, igual a de qualquer serviço (tipo Netflix), e pode ser cancelada quando quisermos.

▶️ Quanto vai custar
- Cerca de R$ 105 a R$ 110 por mês (aproximadamente US$ 19, mais os impostos do cartão por ser cobrança em dólar). É o custo mínimo de manter o banco em tamanho confiável.

▶️ Do que preciso de vocês
- Estou pronto para contratar agora, só preciso de um cartão para cadastrar no Neon e cobrir essa despesa mensal.

▶️ Compromisso
- Vou revisar como o site usa o banco para adotarmos estratégias que reduzam o consumo e evitem precisar de mais no futuro. De todo modo, vamos seguir com o plano pago agora, porque é o que garante o site no ar de forma estável.`;

try {
  const existente = await prisma.incidente.findFirst({
    where: { titulo: TITULO },
    select: { id: true },
  });
  if (existente) {
    console.log("INC já existe, nada a fazer:", existente.id);
  } else {
    // "Quem abriu": usa o nome do admin mais antigo (fallback abaixo).
    const admin = await prisma.admin.findFirst({
      orderBy: { createdAt: "asc" },
      select: { nome: true },
    });
    const abertoPorNome = admin?.nome || "Consultor Digital";

    // Dia 18/SET/2026 ao meio-dia UTC (mesmo dia em São Paulo).
    const abertoEm = new Date(Date.UTC(2026, 8, 18, 12, 0, 0));
    const agora = new Date();

    const inc = await prisma.incidente.create({
      data: {
        titulo: TITULO,
        detalhamento: DETALHAMENTO,
        severidade: "alta",
        status: "em_andamento",
        abertoPorNome,
        abertoEm,
        emAndamentoEm: agora,
        emAndamentoPorNome: abertoPorNome,
      },
      select: { id: true },
    });
    console.log("INC_001 criado:", inc.id, "· aberto por", abertoPorNome);
  }
} catch (e) {
  console.error("Falha ao semear INC_001:", e?.message || e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
