// Seed da seção "Na Mídia" (BAC_130): migra os 2 itens que antes eram um array
// fixo em src/app/na-midia/page.tsx para o banco (model MidiaItem), preservando
// design, thumbnails, avatares e logos. Idempotente: apaga itens com as mesmas
// URLs antes de reinserir, então pode rodar quantas vezes precisar.
//
// Rodar: node --env-file=.env prisma/seed-na-midia.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTOR = { login: "rafael.roquette", nome: "Rafael Roquette" };

const ITENS = [
  {
    tipo: "Coluna",
    veiculo: "Extra · O Globo",
    autor: "Cris Leite",
    titulo: "Coluna da Chef Cris Leite",
    descricao:
      "A coluna da chef Cris Leite no Extra, com bastidores, receitas e reflexões sobre cozinha e gestão.",
    url: "https://extra.globo.com/blogs/chef-cris-leite/post/2026/08/abrimos-uma-cozinha-no-extra.ghtml",
    linksExtras: [],
    thumbUrl: "/brand/midia/coluna-cris.jpg",
    thumbPos: "center 22%",
    avatarUrl: "/brand/fotos/chef-cris-4.png",
    logoVeiculo: "/brand/midia/logo-extra.svg",
    logoAlt: "Extra",
    logoClasse: "h-4 w-auto",
    ordem: 1,
    publicado: true,
  },
  {
    tipo: "Podcast",
    veiculo: "Instagram / Podcast",
    autor: "Gio Gropello",
    titulo: "Cada mesa, uma história",
    descricao:
      "Podcast apresentado por Gio Gropello: histórias por trás das mesas, da gastronomia e da hospitalidade.",
    url: "https://www.instagram.com/cadamesaumahistoria/",
    linksExtras: [
      { label: "Linktree", url: "https://linktr.ee/cadamesaumahistoria" },
      { label: "Site", url: "https://cadamesaumahistoria.my.canva.site/" },
    ],
    thumbUrl: "/brand/midia/podcast-gio.jpg",
    thumbPos: "center",
    avatarUrl: "/brand/fotos/chef-gio-5.png",
    logoVeiculo: "/brand/midia/logo-instagram-color.svg",
    logoAlt: "Instagram",
    logoClasse: "h-[18px] w-[18px]",
    ordem: 2,
    publicado: true,
  },
];

async function main() {
  const urls = ITENS.map((i) => i.url);
  const apagados = await prisma.midiaItem.deleteMany({
    where: { url: { in: urls } },
  });
  if (apagados.count > 0) {
    console.log(`Removidos ${apagados.count} item(ns) antigo(s) para reinserir.`);
  }

  for (const it of ITENS) {
    await prisma.midiaItem.create({
      data: {
        ...it,
        criadoPorLogin: AUTOR.login,
        criadoPorNome: AUTOR.nome,
      },
    });
    console.log(`+ ${it.titulo} (${it.tipo})`);
  }

  const total = await prisma.midiaItem.count();
  console.log(`OK. Total de itens na seção Na Mídia: ${total}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
