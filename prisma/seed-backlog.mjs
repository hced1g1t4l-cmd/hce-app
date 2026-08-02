// Seed único: popula o backlog com os ajustes históricos (CRI/CRIS, GIO, FAB, RAF),
// todos como "Concluído" (FAB_017 como "Cancelado", pois foi decidido manter o Feed),
// com autor pelo prefixo e datas/horas estimadas pela linha do tempo do projeto.
// Idempotente: apaga itens com os mesmos códigos antes de reinserir.
//
// Rodar: node --env-file=.env prisma/seed-backlog.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTORES = {
  cris: { login: "cris.leite", nome: "Cris Leite" },
  gio: { login: "gio.gropello", nome: "Gio Gropello" },
  fab: { login: "fabio.gusmao", nome: "Fábio Gusmão" },
  raf: { login: "rafael.roquette", nome: "Rafael Roquette" },
};

// Grupos: cada pessoa tem um dia-base; os itens são espalhados em horário
// comercial (08:00–19:00). Alguns têm data real específica (override).
const GRUPOS = [
  {
    autor: "gio",
    dia: "2026-07-25",
    itens: [
      ["GIO_001", "Logo do topo maior"],
      ["GIO_002", 'Papéis "Chef, educadora e consultora"'],
      ["GIO_003", "Logo do rodapé maior"],
      ["GIO_004", "Barra do menu amarela"],
      ["GIO_005", "Frase do rodapé trocada"],
      ["GIO_006", "Nova descrição do +HCE"],
      ["GIO_007", 'Fotos viram "flip card" com a mini bio'],
      ["GIO_008", "Slogan oficial no destaque"],
      ["GIO_009", "Logo do hero ainda maior e espaços reduzidos"],
      [
        "GIO_010",
        '"MAIS COMPLETO" centralizado na coluna do Premium',
        "2026-07-28T11:49:00-03:00",
      ],
    ],
  },
  {
    autor: "fab",
    dia: "2026-07-26",
    itens: [
      ["FAB_001", "Menu do topo com fundo (amarelo)"],
      ["FAB_002", "Logo do topo com destaque (não some mais)"],
      ["FAB_003", "Padrão de cores dos títulos ajustado"],
      ["FAB_004", "Botões com transição suave de cor no hover"],
      ["FAB_005", "Correção de gênero nos papéis"],
      ["FAB_006", 'Botões de contato levando ao formulário "Fale com a HCE"'],
      ["FAB_007", "Ícones das redes sociais no rodapé"],
      ["FAB_008", "Crédito RQTTE no rodapé"],
      ["FAB_009", "Refino de cores (texto sobre azul em branco; botões azul↔amarelo)"],
      ["FAB_010", "Correção do FAB_009 (títulos sobre azul em amarelo)"],
      ["FAB_011", "Logo do hero sem borda/relevo e menos espaço no celular"],
      ["FAB_012", '"+" clicável para a foto e texto do envio mais claro (sem "512px")'],
      [
        "FAB_013",
        'Redes sociais sem a palavra "link" (placeholder "cole aqui o link do seu LinkedIn")',
      ],
      ["FAB_014", "Endereço com CEP autocompletável"],
      ["FAB_015", 'Área do usuário virou "Seu conteúdo na HCE" (em vez do feed estático)'],
      ["FAB_016", 'Bio com seta de rolagem (dica de scroll) e sem "toque pra voltar"'],
      // FAB_017: cancelado (decidiram manter o nome do Feed).
      [
        "FAB_017",
        "Renomear o Feed — mantido: veio só como perguntas, sem direção; o time decidiu manter o nome",
        "2026-07-28T12:03:00-03:00",
        "cancelado",
      ],
      ["FAB_018", "WhatsApp incluído nas opções de contato"],
    ],
  },
  {
    autor: "raf",
    dia: "2026-07-25",
    itens: [
      ["RAF_001", "Flip da bio corrigido no celular"],
      ["RAF_002", "Texto do botão centralizado e responsivo"],
      ["RAF_003", "Flip aprimorado (verso com rolagem começando do topo)"],
      ["RAF_004", 'Crédito "Desenvolvido por rqtte" com link'],
      ["RAF_005", "Botão do Clube centralizado no celular"],
      ["RAF_006", "Bio sempre reabre do topo"],
      ["RAF_007", 'Página "Quero ser avisado do lançamento" (com painel interno)'],
      ["RAF_008", 'Página "Fale com a HCE" (com painel interno)'],
      ["RAF_009", "Fotos da Cris e do Gio com ombros alinhados"],
      ["RAF_010", "Crédito do desenvolvedor ajustado"],
      ["RAF_011", "Consentimentos do cadastro simplificados"],
      ["RAF_012", "20 melhorias de UX/UI (acessibilidade, animações, SEO, 404)"],
      ["RAF_013", "Painel de acessos no /adm (gráfico, mapa por cidade, filtros de período)"],
      ["RAF_014", "Referências ao WhatsApp removidas por ora (voltam com número oficial)"],
      ['RAF_015', 'Favicon com a panelinha do "C" (fundo azul)', "2026-07-26T09:00:00-03:00"],
      ["RAF_016", "Foto de perfil com redução automática de resolução", "2026-07-26T10:00:00-03:00"],
      [
        "RAF_017",
        "Perfil completo: bio, LinkedIn/Instagram/Facebook, telefone e endereço",
        "2026-07-26T11:00:00-03:00",
      ],
      [
        "RAF_018",
        "Endereço com campos padrão (Logradouro, Número, Complemento, Bairro, Cidade, Estado, País)",
        "2026-07-26T12:00:00-03:00",
      ],
      [
        "RAF_019",
        'No /adm: foto do usuário + janela com mais dados e "Último acesso"',
        "2026-07-26T14:00:00-03:00",
      ],
      ["RAF_020", "No /adm: flag para excluir + campo de observações", "2026-07-26T15:00:00-03:00"],
      [
        "RAF_021",
        "Infraestrutura de mídia no Cloudflare R2 (upload direto com barra de progresso)",
        "2026-07-26T16:00:00-03:00",
      ],
      [
        "RAF_022",
        '"Minha conta" com menu lateral (perfil, detalhes, pagamento "em construção")',
        "2026-07-27T10:00:00-03:00",
      ],
      ["RAF_023", "Exportação em PDF corrigida (sem página em branco)", "2026-07-27T11:00:00-03:00"],
      [
        "RAF_024",
        "Feed exige conta (mesmo a gratuita) para captação de leads",
        "2026-07-27T15:00:00-03:00",
      ],
      [
        "RAF_025",
        "Verificação de e-mail obrigatória: código de 6 dígitos válido por 100s, com reenvio",
        "2026-07-28T09:00:00-03:00",
      ],
      [
        "RAF_026",
        'Cadastro com senha em 2 campos + regras ao vivo e botão "olho"',
        "2026-07-28T10:00:00-03:00",
      ],
      ["RAF_027", '"Esqueci minha senha" com reCAPTCHA', "2026-07-28T11:00:00-03:00"],
      [
        "RAF_028",
        "E-mails automáticos saindo de naoresponda@hcegastronomia.com",
        "2026-07-28T14:00:00-03:00",
      ],
      ['RAF_029', 'Botão "Enviar código de confirmação" centralizado', "2026-07-28T15:30:00-03:00"],
    ],
  },
  {
    autor: "cris",
    dia: "2026-07-27",
    itens: [
      ["CRIS_001", 'Pilar Hospitalidade ("A hospitalidade é um ativo estratégico…")', "2026-07-25T08:00:00-03:00"],
      [
        "CRIS_002",
        "Apresentação do rodapé (desenvolver pessoas, equipes e resultados em A&B)",
        "2026-07-25T08:20:00-03:00",
      ],
      ["CRI_003", 'Nome correto "+HCE" e nova descrição'],
      ["CRI_004", '"Encontre a assinatura ideal para você"'],
      ["CRI_005", 'Rótulos "Feed HCE" nos planos'],
      ["CRI_006", "Recursos do plano Essencial"],
      ["CRI_007", "Recursos do plano Premium"],
      ["CRI_008", '"Aprendizado contínuo"'],
      ["CRI_009", '"Novas soluções para Cozinha"'],
      ["CRI_011", "Missão (referência em gastronomia, hospitalidade e gestão)"],
      ["CRI_012", 'Valor "As pessoas em primeiro lugar"'],
      ["CRI_013", '"Como a HCE pode contribuir com você?"'],
      ["CRI_014", '"Conte seu desafio ou sua ideia"'],
      ["CRI_015", '"O que fazemos: consultoria, educação e hospitalidade para A&B"'],
      ["CRI_016", "Diagnóstico e consultoria em A&B"],
      ["CRI_017", "Cultura de serviço, atendimento e fidelização"],
      ["CRI_018", "Formação, cursos e workshops"],
      ["CRI_019", "Palestras, mentorias e produções autorais"],
      ["CRI_020", "Projeto pontual"],
      ["CRI_021", 'Contato "Fale com a HCE"'],
      ["CRI_022", "Aviso LGPD (confidencialidade)"],
      ["CRI_023", '"Conta gratuita / Crie sua conta"'],
      ["CRI_024", "Hero (Hospitalidade · Consultoria · Educação)"],
      ["CRI_025", 'Quem somos ("Duas trajetórias, uma paixão pela gastronomia")'],
      ["CRI_026", 'Revisão do "O que fazemos"'],
      ["CRI_027", 'Revisão do "Contato / Fale com a HCE"'],
      ["CRI_028", '"Hospitalidade como cultura"'],
      ["CRI_029", '"Como a HCE pode contribuir com você?" (revisão)'],
      ["CRI_030", "Diagnóstico operacional e consultoria em A&B"],
      ["CRI_031", "Cultura de serviço (revisão)"],
      ["CRI_032", "Cursos e workshops (revisão)"],
      ["CRI_033", "Palestras, mentorias e conteúdo"],
      ["CRI_034", "Projeto pontual (revisão)"],
      ["CRI_035", "Curso / Workshop (formatos presencial e on-line)"],
      ["CRI_036", '+HCE "Quero ser avisado do lançamento"'],
      ["CRI_037", "Aviso LGPD (Quero ser avisado)"],
      ["CRI_038", "Conta gratuita (revisão)"],
      ["CRI_039", "Consentimentos (termos + newsletter)"],
      ["CRI_040", '"Vamos transformar o seu negócio?"'],
      ["CRI_041", "Pagamento (cartão recorrente ou PIX) e descontos"],
      ["CRI_042", '"+HCE ainda não abriu, garanta seu lugar"'],
      ["CRI_043", "Podcast (conversas sobre hospitalidade e A&B)"],
      ["CRI_044", "FAQ: atendimento presencial e on-line"],
      ["CRI_045", "FAQ: o que é o +HCE"],
      ["CRI_046", "FAQ: últimos ajustes / cadastre-se para o lançamento"],
      ["CRI_047", "FAQ: pagamento por cartão de crédito ou PIX"],
    ],
  },
];

// Espalha N itens entre 08:00 e 19:00 do dia informado (horário -03:00).
function horarioEspalhado(dia, indice, total) {
  const inicioMin = 8 * 60; // 08:00
  const fimMin = 19 * 60; // 19:00
  const passo = total > 1 ? (fimMin - inicioMin) / (total - 1) : 0;
  const min = Math.round(inicioMin + passo * indice);
  const hh = String(Math.floor(min / 60)).padStart(2, "0");
  const mm = String(min % 60).padStart(2, "0");
  return new Date(`${dia}T${hh}:${mm}:00-03:00`);
}

function esc(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const registros = [];
  const codigos = [];

  for (const grupo of GRUPOS) {
    const autor = AUTORES[grupo.autor];
    const total = grupo.itens.length;
    grupo.itens.forEach((item, i) => {
      const [codigo, label, dataReal, statusOverride] = item;
      codigos.push(codigo);
      const created = dataReal
        ? new Date(dataReal)
        : horarioEspalhado(grupo.dia, i, total);
      const iniciado = new Date(created.getTime() + 8 * 60000);
      const concluido = new Date(created.getTime() + 45 * 60000);
      const status = statusOverride || "concluido";

      const base = {
        titulo: `${codigo} · ${label}`,
        descricao: `<p>${esc(label)}</p>`,
        prioridade: "media",
        status,
        criadoPorLogin: autor.login,
        criadoPorNome: autor.nome,
        iniciadoEm: iniciado,
        iniciadoPorNome: autor.nome,
        createdAt: created,
      };

      if (status === "cancelado") {
        base.canceladoEm = concluido;
        base.canceladoPorNome = autor.nome;
      } else {
        base.concluidoEm = concluido;
        base.concluidoPorNome = autor.nome;
      }
      registros.push(base);
    });
  }

  // Idempotência: remove itens com os mesmos códigos (titulo começa com "CODIGO ·").
  const del = await prisma.backlogItem.deleteMany({
    where: { OR: codigos.map((c) => ({ titulo: { startsWith: `${c} ·` } })) },
  });

  await prisma.backlogItem.createMany({ data: registros });

  console.log(
    `Removidos ${del.count} · Inseridos ${registros.length} itens de backlog.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
