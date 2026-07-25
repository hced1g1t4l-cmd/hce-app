# HCE, app (site + Clube HCE)

Base de código única do ecossistema digital da HCE. Um projeto Next.js que vai
abrigar o site institucional, o Clube HCE (assinaturas), o gerenciador de
conteúdo e o orquestrador do negócio.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Prisma + PostgreSQL (Neon)
- Auth.js (NextAuth v5)
- Zod (validação), Prettier (formatação)

## Rodar localmente

Pré-requisitos: Node 20+.

1. Instale as dependências:

```bash
npm install
```

2. Crie o `.env.local` a partir do exemplo e preencha os valores:

```bash
cp .env.example .env.local
```

- `DATABASE_URL`: connection string do Neon (crie um projeto grátis em neon.tech).
- `AUTH_SECRET`: gere com `npx auth secret`.

3. Gere o Prisma Client e crie as tabelas no banco:

```bash
npm run db:generate
npm run db:push
```

4. Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Abra http://localhost:3000.

## Scripts

| Script                | O que faz                                |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento              |
| `npm run build`       | Build de produção                        |
| `npm run start`       | Sobe o build de produção                 |
| `npm run lint`        | ESLint                                   |
| `npm run typecheck`   | Checagem de tipos (tsc)                  |
| `npm run format`      | Formata com Prettier                     |
| `npm run db:generate` | Gera o Prisma Client                     |
| `npm run db:push`     | Aplica o schema no banco (sem migration) |
| `npm run db:migrate`  | Cria/roda migrations                     |
| `npm run db:studio`   | Abre o Prisma Studio                     |

## Estrutura

```
src/
├── app/                     # rotas (App Router)
│   ├── api/auth/[...nextauth]/route.ts   # handler do Auth.js
│   ├── layout.tsx
│   └── page.tsx
├── auth.ts                  # config do Auth.js (providers entram depois)
├── components/              # componentes de UI reutilizaveis
├── features/                # modulos por dominio (clube, conteudo, etc.)
└── lib/
    ├── db.ts                # singleton do Prisma Client
    └── env.ts               # validacao das variaveis de ambiente
prisma/
└── schema.prisma           # modelos (User/Account/Session + Role)
```

## Observações

- O `.env.local` nunca é comitado (já está no `.gitignore`).
- Os providers de login do Auth.js entram na atividade de autenticação.
- Sem `DATABASE_URL` o app sobe, mas rotas que consultam o banco falham; só é
  necessário quando começarmos a persistir dados.
