# Projeto HCE — Base de Conhecimento

> Workspace dedicado ao projeto digital da **HCE** (Chef Cris Leite + Gio Gropello), tocado tecnicamente por **Rafael Roquette**.
> Esta base cresce a cada novo e-mail, transcrição, resposta ou material que o Rafa adicionar. É a fonte de verdade única do projeto.

**Última atualização:** 25/07/2026 (19:10)
**Data-alvo do MVP:** 12/09/2026 (~9 semanas)

> 📌 **Visão executiva de 1 página:** [`docs/00-visao-executiva.md`](docs/00-visao-executiva.md)
> 🛠 **Stack técnico proposto:** [`docs/08-recomendacoes-tecnicas/stack-e-fornecedores.md`](docs/08-recomendacoes-tecnicas/stack-e-fornecedores.md)

---

## 1. Estado Atual (o que já sabemos)

### Conceito
A HCE está migrando de um modelo tradicional de consultoria/treinamento (com teto de receita) para um **ecossistema digital com receita recorrente (SaaS)**, mantendo consultoria e treinamento como carro-chefe B2B. Referência principal: [Foodness](https://somosfoodness.com).

### Os 4 entregáveis
1. **Site institucional** — vitrine + hospedagem + e-mails corporativos.
2. **SaaS "Clube HCE"** — site + app com fichas técnicas, receitas, aulas por assinatura.
3. **Gerenciador de Conteúdos** — automação de posts, redes sociais, e-mail marketing.
4. **Orquestrador do Negócio** — dashboard com KPIs, leads, assinantes, agenda.

### Marcos combinados até agora
- **10/07/2026** — Reunião inicial (Cris, Gio, Rafa). Alinhamento de escopo.
- **10/07/2026 (13:46)** — Briefing enviado por e-mail (formulário guiado + cronograma).
- **16/07/2026 (proposta)** — Primeira reunião de kickoff, quarta 18h.
- **12/09/2026** — MVP no ar.

### Combinados operacionais
- **Reunião semanal** — quartas 18h (a confirmar).
- **Grupo de WhatsApp** — "hce - Projeto Digital" (Rafa cria nas próximas 24h).
- **Drive compartilhado** — [pasta HCE no Google Drive](https://drive.google.com/drive/folders/1bsPoyjYHYDgX-KHgC4CjZyX1xHO7lnt6?usp=sharing).
- **Pedido do Rafa:** respostas do briefing devem ser **humanas, sem IA generativa**.

### Domínio
- **Domínio principal: `hcegastronomia.com`** (registrado no HostGator). É o endereço oficial do site, do app e dos e-mails (`@hcegastronomia.com`).
- **`hcegastronomia.com.br`** (registrado no registro.br) fica como **redirect 301 para o `hcegastronomia.com`**: quem acessar o `.com.br` é direcionado automaticamente para o `.com`, concentrando o SEO num endereço só.
- DNS dos dois será gerenciado na **Cloudflare** (troca de nameservers). Hospedagem compartilhada dispensada (site na Vercel, e-mail no Zoho).
- Credenciais do HostGator e do registro.br já estão com o Rafael.

### Pendências técnicas conhecidas
- `somosfoodness.com` retornou **403 Forbidden** quando tentamos acessar em 10/07/2026. Reavaliar depois.

---

## 2. Estrutura da Base

```
HCE/
├── README.md                        ← este arquivo (índice vivo)
├── .cursor/rules/
│   └── hce-project-context.mdc      ← regra que faz o Cursor sempre ler esta base
└── docs/
    ├── 00-visao-executiva.md        ← resumo de 1 página
    ├── 01-transcricoes/             ← transcrições de reuniões
    ├── 02-emails-enviados/          ← e-mails que o Rafa mandou
    ├── 03-emails-recebidos/         ← respostas do Cris e do Gio
    ├── 04-respostas-clientes/       ← respostas consolidadas ao briefing
    ├── 05-materiais-recebidos/      ← logos, fotos, fichas, PDFs, prints
    ├── 06-referencias-externas/     ← sites e apps de inspiração
    ├── 07-decisoes-e-perguntas/     ← log de decisões e questões em aberto
    └── 08-recomendacoes-tecnicas/   ← stack, fornecedores, arquitetura (uso interno do Rafa)
```

---

## 3. Índice de Conteúdos

### 3.0 Visão executiva
- [Visão executiva (1 página)](docs/00-visao-executiva.md)

### 3.1 Transcrições de reunião
- [2026-07-10 — Reunião inicial (Cris, Gio, Rafa)](docs/01-transcricoes/2026-07-10-reuniao-inicial.md)

### 3.2 E-mails enviados
- [2026-07-10 13:46 — Briefing do Projeto e Levantamento de Requisitos](docs/02-emails-enviados/2026-07-10-briefing-projeto.md)

### 3.3 E-mails recebidos
- _(vazio — aguardando primeira resposta do Cris/Gio)_

### 3.4 Respostas ao briefing (formulário consolidado)
- [Respostas do briefing (vivo)](docs/04-respostas-clientes/respostas-briefing.md) — _em branco, aguardando preenchimento_

### 3.5 Materiais recebidos
- _(vazio — aguardando material do Drive)_
- **Pendente:** anexo `image.png` mencionado pelo Rafa em 10/07 não foi encontrado no workspace — pedir novamente.

### 3.6 Referências externas
- [Sites e apps de inspiração](docs/06-referencias-externas/inspiracoes.md)

### 3.7 Decisões e perguntas em aberto
- [Log de decisões e perguntas](docs/07-decisoes-e-perguntas/log.md)

### 3.8 Recomendações técnicas (uso interno do Rafa)
- [Stack e fornecedores](docs/08-recomendacoes-tecnicas/stack-e-fornecedores.md) — hospedagem, plataforma SaaS, gateway de pagamento, estimativa de custos por cenário.

---

## 4. Como Adicionar Novos Conteúdos

Quando chegar um novo e-mail, transcrição, resposta ou material, seguir o padrão:

| Tipo | Onde salvar | Formato do nome |
|---|---|---|
| Transcrição de reunião | `docs/01-transcricoes/` | `YYYY-MM-DD-titulo.md` |
| E-mail enviado | `docs/02-emails-enviados/` | `YYYY-MM-DD-assunto.md` |
| E-mail recebido | `docs/03-emails-recebidos/` | `YYYY-MM-DD-remetente-assunto.md` |
| Respostas do briefing | `docs/04-respostas-clientes/respostas-briefing.md` | (arquivo único, editar) |
| Material bruto | `docs/05-materiais-recebidos/` | nome descritivo + origem |
| Referência externa | `docs/06-referencias-externas/inspiracoes.md` | (arquivo único, editar) |
| Decisão / pergunta | `docs/07-decisoes-e-perguntas/log.md` | (arquivo único, editar) |

Depois de qualquer adição:
1. Atualizar o índice acima com o link para o novo arquivo.
2. Atualizar a seção "Estado Atual".
3. Adicionar entrada no Changelog abaixo.

---

## 5. Changelog

- **2026-07-25 (19:10)** — ✅ **Fundação de infra concluída.** Site no ar em `https://www.hcegastronomia.com` (Vercel + domínio próprio + SSL). Banco Neon conectado em produção (conexão pooled + directUrl), comprovado pela rota `/api/health` retornando `"db":"connected"`. Env vars configuradas no Vercel. Próxima frente: design system + site institucional. Detalhes no log de decisões.
- **2026-07-25 (12:45)** — Correção do domínio: o correto é `hcegastronomia.com` (+ `.com.br`), não `hce.com` (esse foi adicionado por engano na Cloudflare e será removido; teve dono anterior). Todos os documentos do projeto atualizados; passo a passo do Fabio removido para ser refeito com o domínio e nameservers corretos.
- **2026-07-25 (10:20)** — Domínio definido: `hcegastronomia.com` como principal (HostGator) e `hcegastronomia.com.br` como redirect 301 (registro.br). DNS dos dois migrando para a Cloudflare via troca de nameservers. Credenciais dos dois registradores em mãos.
- **2026-07-24 (23:50)** — Atividade 1 (arquitetura) concluída. Stack confirmada: Next.js unificado na Vercel, PostgreSQL/Neon + Prisma, Payload CMS, Auth.js, Stripe (início), Bunny/R2, Zoho Mail e Cloudflare (DNS). Hospedagem compartilhada dispensada no MVP. Detalhe em `hce-decisao-arquitetura.md` (raiz). Iniciada a atividade 5 (scaffold do app em `HCE/app`).
- **2026-07-10 (14:18)** — Adicionada visão executiva (`docs/00-visao-executiva.md`) e documento de recomendações técnicas (`docs/08-recomendacoes-tecnicas/stack-e-fornecedores.md`) com stack proposto (Hostinger + Next.js/Vercel + Supabase + Asaas + PWA/Capacitor) e estimativa de custos por cenário. Resolvida dúvida sobre `wesleyss@ciandt.com` no e-mail (era resíduo, sem ação).
- **2026-07-10 (13:46)** — Criação da base de conhecimento. Registrado: transcrição da 1ª reunião, briefing enviado por e-mail, referências externas iniciais, log de perguntas em aberto.
