// Seed dos depoimentos (BAC_137): migra os 8 depoimentos que antes eram um
// array fixo em components/site/depoimentos-home.tsx para o banco (model
// Depoimento), preservando textos, cargos e fotos. Idempotente: apaga itens
// com os mesmos nomes antes de reinserir.
//
// Rodar: node --env-file=.env prisma/seed-depoimentos.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTOR = { login: "rafael.roquette", nome: "Rafael Roquette" };

const ITENS = [
  {
    nome: "Gabriel Monteiro de Abreu Coutinho",
    cargo: "Chef e proprietário · Atelier Coutinho",
    foto: "/brand/depoimentos/gabriel-monteiro.jpg",
    texto:
      "Tive o privilégio de ter Giovani e Cris como meus mestres na graduação em Gastronomia e posso dizer, com toda certeza, que são dois dos profissionais mais competentes, dedicados e generosos que já conheci. O que mais me marcou em toda essa experiência foi a forma como ambos conseguem unir muita excelência técnica a uma paixão genuína por ensinar. Isso transformou a maneira como passei a enxergar a gastronomia dali em diante.\n\nMais do que técnicas e receitas, aprendi com eles a ter disciplina, a trabalhar com confiança, a ser extremamente detalhista e a entender que a excelência está nos pequenos cuidados.",
  },
  {
    nome: "Felipe Ruchiga",
    cargo:
      "Gerente de Grupos e Eventos · Le Canton — Ex-chef do Bacalhau & Cia (CADEG)",
    foto: "/brand/depoimentos/felipe-ruchiga.jpg",
    texto:
      "Minha experiência com a Cris Leite, e o que naquele momento era o embrião da HCE, foi extremamente positiva e marcou um momento muito importante da minha trajetória profissional. Durante a inauguração do Bacalhau & Cia, no CADEG, em 2015/2016, toda a experiência da Cris foi fundamental para a estruturação da operação, desde a elaboração do cardápio até o treinamento completo da equipe.\n\nO que mais me chamou a atenção foi a capacidade de transmitir conhecimento de forma prática, organizada e segura. Com sua consultoria, ganhamos confiança para dar continuidade ao trabalho, mantendo o padrão de qualidade que havia sido implantado desde o início.\n\nRecomendo fortemente a HCE para consultorias, treinamentos e mentorias. É um trabalho sério, realizado por profissionais com grande experiência, que realmente fazem a diferença na implantação, no desenvolvimento e na continuidade de qualquer negócio de hospitalidade e gastronomia.",
  },
  {
    nome: "Tauana Torres",
    cargo: "Chef de partie · Ocyá",
    foto: "/brand/depoimentos/tauana-torres.jpg",
    texto:
      "Tive o privilégio de conhecer a HCE em dois momentos muito importantes da minha trajetória: primeiro como aluna e, depois, trabalhando ao lado da Cris e do Gio. Posso dizer que grande parte da profissional que sou hoje foi construída por meio dos ensinamentos, da exigência e do exemplo dos dois.\n\nO que mais me marcou foi a forma como transformam conhecimento técnico em aprendizado prático, sempre incentivando a busca pela excelência, organização e respeito pela profissão. Até hoje aplico diariamente tudo o que aprendi com eles, tanto na parte técnica quanto na postura profissional.\n\nRecomendo a HCE com toda a confiança, porque sei que ali o ensino é verdadeiro, conduzido por profissionais que realmente se dedicam a formar pessoas preparadas para o mercado e apaixonadas pela gastronomia.",
  },
  {
    nome: "Cássio Ayres",
    cargo: "Private chef",
    foto: "/brand/depoimentos/cassio-ayres.jpg",
    texto:
      "Conheço o Giovanni e a Cris há bastante tempo e confio muito na forma como trabalham. Eles unem competência, organização, experiência e um cuidado genuíno com as pessoas. Isso se reflete em conteúdos muito bem estruturados, didáticos e fundamentados tanto na técnica quanto na prática. Tenho certeza de que a HCE nasce com uma base muito sólida e recomendo o trabalho deles com total tranquilidade a quem busca aprendizado de qualidade.",
  },
  {
    nome: "Yuri Andrade de Fonseca Ovidio",
    cargo: "Sócio · Oishi Pastel",
    foto: "/brand/depoimentos/yuri-andrade.jpg",
    texto:
      "Estudar com os professores Gio e Cris foi uma experiência extraordinária. A paixão deles pelo ensino e o domínio dos conteúdos tornaram cada aula envolvente e inspiradora. Eles sempre incentivaram a participação e o debate, o que me permitiu aprofundar meu conhecimento e desenvolver novas habilidades. A forma como apresentaram os temas, tornando-os acessíveis e relevantes, fez toda a diferença na minha jornada de aprendizado.\n\nSou grato por ter tido a oportunidade de aprender com profissionais tão dedicados e competentes.",
  },
  {
    nome: "Leonardo Dourado",
    cargo:
      "Proprietário · Produto Artesanal — Comércio e Fabricação de Alimentos (RJ)",
    foto: "/brand/depoimentos/leonardo-dourado.jpg",
    texto:
      "Tenho muita gratidão pela oportunidade de aprender com a Cris Leite e o Gio Gropello ao longo da minha formação. Conheço a Cris desde 2016, quando foi minha professora na graduação, e posteriormente também na pós-graduação. Sempre admirei o conhecimento, a dedicação e a forma inspiradora com que ambos compartilham suas experiências.\n\nOs aprendizados recebidos contribuíram muito para minha visão da gastronomia e para meu crescimento profissional. Recomendo a HCE pela excelência dos professores e pela qualidade do ensino oferecido.",
  },
  {
    nome: "Luckas Hermann Terra (Bruce Kind)",
    cargo: "Pesquisador e doutorando · UFRJ",
    foto: "/brand/depoimentos/bruce-kind.jpg",
    texto:
      "Cris e Gio foram meus professores na minha segunda graduação. Durante a minha vida, já fiz duas graduações, diversos cursos e especializações; não falo isso para me gabar, mas para dizer que, de todos os lugares por onde já passei, sem dúvida, eles foram os melhores professores que já tive! A forma de ensinar é totalmente fora da curva. Dava para ver como eles se dedicam ao planejamento das disciplinas, a produzir e testar as fichas técnicas antes das aulas, além de estarem sempre atualizados, buscando novidades para os alunos.\n\nAtualmente, trabalho em um projeto que demanda conhecimentos sobre consultoria, gestão de alimentos e bebidas e elaboração de fichas técnicas; sempre que tenho uma dúvida, são as consultas aos materiais que eles produziram que me salvam. Recomendo a HCE de olhos fechados, pois confio na qualidade do seu conteúdo e de quem o ensina.",
  },
  {
    nome: "Ricardo Louveira",
    cargo: "Chef executivo · Sushi da Praça",
    foto: "/brand/depoimentos/ricardo-louveira.jpg",
    texto:
      "O que mais me chamou a atenção no trabalho da HCE foi a responsabilidade e o profissionalismo demonstrados ao longo de todo o processo. Tive um desenvolvimento técnico significativo, que me permitiu adquirir uma nova perspectiva sobre atividades que eu já realizava há anos, aprimorando minha postura, minha organização e a forma de trabalhar com os insumos locais. Eu recomendo a HCE porque a empresa é formada por pessoas em quem confio e que demonstram alta competência no que se propõem a fazer.",
  },
];

async function main() {
  const nomes = ITENS.map((i) => i.nome);
  const apagados = await prisma.depoimento.deleteMany({
    where: { nome: { in: nomes } },
  });
  if (apagados.count > 0) {
    console.log(`Removidos ${apagados.count} depoimento(s) antigo(s).`);
  }

  let ordem = 1;
  for (const it of ITENS) {
    await prisma.depoimento.create({
      data: {
        nome: it.nome,
        cargo: it.cargo,
        texto: it.texto,
        fotoUrl: it.foto,
        formato: "texto",
        ordem: ordem++,
        publicado: true,
        criadoPorLogin: AUTOR.login,
        criadoPorNome: AUTOR.nome,
      },
    });
    console.log(`+ ${it.nome}`);
  }

  const total = await prisma.depoimento.count();
  console.log(`OK. Total de depoimentos: ${total}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
