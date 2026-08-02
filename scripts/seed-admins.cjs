// Cria os 4 admins iniciais do painel /adm (idempotente).
// Senha inicial = primeiro nome + 2026 (ex.: cris2026), com troca obrigatoria.
// NAO sobrescreve senha/dados de um admin que ja exista.
//
// Rodar: node scripts/seed-admins.cjs
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const dk = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${dk.toString("hex")}`;
}

const ADMINS = [
  { login: "cris.leite", nome: "Cris Leite", senha: "cris2026" },
  { login: "gio.gropello", nome: "Gio Gropello", senha: "gio2026" },
  { login: "fabio.gusmao", nome: "Fabio Gusmão", senha: "fabio2026" },
  { login: "rafael.roquette", nome: "Rafael Roquette", senha: "rafael2026" },
];

async function main() {
  for (const a of ADMINS) {
    const existe = await prisma.admin.findUnique({ where: { login: a.login } });
    if (existe) {
      console.log(`= ja existe: ${a.login} (mantido)`);
      continue;
    }
    await prisma.admin.create({
      data: {
        login: a.login,
        nome: a.nome,
        senhaHash: hashPassword(a.senha),
        precisaTrocarSenha: true,
        ativo: true,
        criadoPor: "seed",
      },
    });
    console.log(`+ criado: ${a.login} (senha inicial: ${a.senha})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
