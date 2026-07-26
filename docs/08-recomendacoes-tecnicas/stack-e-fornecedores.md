# Recomendações Técnicas — Stack, Hospedagem, SaaS e Pagamentos

> **Objetivo:** entregar o MVP em 12/09/2026 gastando o mínimo possível de dinheiro e tempo, sem sacrificar profissionalismo.
> **Público desta doc:** Rafa (uso interno). Uma versão simplificada é apresentada para Cris/Gio no kickoff.
> **Última atualização:** 10/07/2026

---

## 1. Diretrizes que guiam as escolhas

1. **Baixo custo inicial** — a HCE ainda não tem receita recorrente. Nada de contrato caro antes de validar.
2. **Escalar sem replatformar** — evitar ferramentas que "quebrem" quando o clube tiver 1.000 assinantes.
3. **Cris/Gio operam sozinhos depois** — todo painel administrativo precisa ser usável por pessoa não-técnica.
4. **Brasil primeiro** — PIX, cartão em reais, notas fiscais brasileiras.
5. **App Android via Play Store no MVP; iOS pós-MVP** — decisão já tomada na reunião.

---

## 2. Domínio + Hospedagem + E-mails corporativos

### Recomendação
**Domínio:** manter onde já foi comprado (via Fábio — confirmar registrador).

**Hospedagem + e-mails:** **Hostinger Business (Brasil)**
- ~R$ 24-35/mês no plano anual.
- SSL grátis, backups diários, 100 GB SSD, cPanel/hPanel simples.
- **100 contas de e-mail corporativo incluídas** (mais que suficiente para as 4-5 caixas iniciais).
- Painel em português, suporte 24/7 em português.
- Migração para outro provedor é indolor no futuro (é padrão de mercado).

**E-mails corporativos:** integrar as caixas do domínio ao **Gmail via IMAP** (envio/recebimento pela interface do Gmail que Cris/Gio já usam). Assinatura corporativa padronizada.

### Alternativas consideradas

| Opção | Prós | Contras | Veredicto |
|---|---|---|---|
| **Google Workspace** | Melhor UX de e-mail, calendário, drive integrado | R$ 34/usuário/mês só de e-mail; hospedagem separada | Considerar quando MRR > R$ 3k/mês |
| **Locaweb** | Marca conhecida no BR | Mais caro (R$ 40+), UX antiga | Não |
| **HostGator BR** | Barato | Suporte piorou nos últimos anos | Não |
| **KingHost** | Boa reputação BR | Mais caro que Hostinger para o mesmo pacote | Não |

**Custo estimado:** R$ 25-30/mês (~R$ 300-360/ano).

---

## 3. Site Institucional

### Recomendação
**Next.js hospedado no Vercel (plano free/hobby)**, com CMS **Sanity** ou **Payload CMS** para Cris/Gio editarem conteúdo.

- Vercel free cobre tranquilamente o volume esperado no primeiro ano.
- Domínio principal (`hcegastronomia.com.br`) apontado para o Vercel; e-mails continuam na Hostinger.
- Deploy contínuo (cada mudança sobe automático) sem intervenção manual da Cris/Gio.
- SEO nativo (server-side rendering), performance máxima.

### Por que não WordPress
- WordPress exige plugin em cima de plugin, quebra sozinho, precisa update constante.
- Ficar refém de plugin de assinatura (WooCommerce Memberships etc.) trava a evolução do clube.
- Só compensa se **não fôssemos** construir o clube customizado — o que não é o caso.

### Alternativas consideradas para o site

| Opção | Prós | Contras | Veredicto |
|---|---|---|---|
| **Webflow** | Editor visual bom | Mensalidade (~R$ 100+/mês), lock-in | Não |
| **Framer** | Muito bonito, rápido | Idem Webflow | Só se Rafa não tocar o dev |
| **WordPress** | Universal | Manutenção alta, quebra fácil | Não |

**Custo estimado:** R$ 0/mês (Vercel free) + R$ 0-100/mês do CMS (Sanity free tier cobre bem).

---

## 4. SaaS "Clube HCE" (o coração do projeto)

Esta é a decisão mais estratégica. Duas rotas viáveis:

### Rota A — **Custom (recomendada)**
**Stack:**
- **Next.js** (mesmo do site, mesmo repo/ou mono-repo).
- **Supabase** (banco Postgres + auth + storage — free tier generoso).
- **Stripe** (pagamentos internacional, se abrirmos mercado latam) **OU** **Asaas/Pagar.me** para BR-only (recomendação para MVP).
- **Mux** ou **Cloudinary** para vídeos das aulas (se decidirem incluir vídeo já no MVP).

**Prós:**
- Controle total sobre UX, preços, planos, upsell, retenção.
- Custo por assinante muito baixo (~R$ 0,50-1,00) contra 10-30% de comissão de plataforma.
- Um único banco alimenta site + app + orquestrador (dashboard).
- App Android nativo consome a mesma API.

**Contras:**
- Mais trabalho técnico (Rafa desenvolve).
- Não temos Cris/Gio para "brincar" sozinhos sem quebrar — precisamos criar admin.

### Rota B — **Plataforma pronta (Hotmart Club / Kiwify / Memberkit)**
**Como funciona:** monta-se o clube na plataforma, ela cuida do pagamento, do login, do streaming de vídeo, dos e-mails de cobrança. O site institucional aponta para a plataforma.

**Prós:**
- MVP em 2 semanas em vez de 6-8.
- Cris/Gio publicam conteúdo sozinhos.
- Sem preocupação com fraude, chargeback, PCI-DSS.

**Contras:**
- Taxa **9-15%** sobre cada venda (Hotmart) ou mensalidade fixa (Memberkit ~R$ 150+/mês).
- App próprio: Memberkit tem app whitelabel (pago); Hotmart não tem app dedicado do produtor.
- Orquestrador (dashboard) precisa **importar dados** via API (nem todas expõem).
- Difícil escapar do lock-in quando crescer.

### Recomendação final para o MVP
**Rota A (custom), começando enxuto:**
- Sem vídeo streaming no MVP — fichas técnicas + PDFs + textos + imagens só. Vídeo entra em iteração 2.
- Fichas técnicas viram páginas HTML no clube (não PDF para download — melhor SEO, favoritos, busca).
- Um plano só no lançamento (`Clube HCE Mensal — R$ 39,90`), promoção fundadores (R$ 24,90 vitalício para os primeiros 100).
- Depois de 2-3 meses de mercado, avaliar segundo plano (`Anual` com desconto) e freemium.

**Alternativa de contingência:** se atrasarmos a Semana 5-6, subir uma versão intermediária no **Kiwify** só para não perder Black Friday.

**Custo estimado do stack custom (mensal, MVP):**
- Vercel: R$ 0
- Supabase: R$ 0 até 500 MB DB / 1 GB storage; ~R$ 125 (US$ 25) quando cruzar.
- Asaas: **1,99% + R$ 0,49 por transação PIX**; cartão recorrente ~4,99% + R$ 0,49.
- Total fixo: **~R$ 25-30/mês** (só a hospedagem) até estourar o free tier.

---

## 5. Gateway de Pagamento

### Recomendação
**Asaas** para o MVP.

**Por quê:**
- Cadastro simples (PJ), aprovação rápida.
- **PIX + Cartão recorrente + Boleto** em uma única API.
- Taxa competitiva no PIX (1,99% + R$ 0,49) — importante porque brasileiro adora PIX.
- Emite **NFS-e automática** (economiza contador).
- Portal do assinante já pronto (histórico de cobranças, atualizar cartão).
- Antifraude embutido.

### Comparativo

| Provedor | PIX | Cartão recorrente | NF-e | Setup | Nota |
|---|---|---|---|---|---|
| **Asaas** | 1,99% + R$ 0,49 | 4,99% + R$ 0,49 | ✅ automática | 24-48h | **✅ Recomendado MVP** |
| **Pagar.me (Stone)** | 0,99% | 3,99% + R$ 0,39 | ❌ | 5-10 dias | Melhor quando MRR > R$ 20k/mês |
| **Mercado Pago** | 0,99% | 4,99% | Manual | Fácil | UX ruim, suporte fraco |
| **Stripe** | Recém-lançou PIX BR | 3,99% + R$ 0,39 | ❌ (precisa outro serviço) | Fácil | Melhor para receber em USD |
| **Iugu** | 1,99% | 4,99% | ✅ | Médio | Alternativa razoável ao Asaas |

**Custo estimado por assinante (R$ 39,90/mês pago em PIX):** R$ 0,79 de PIX + R$ 0,49 = **R$ 1,28**. HCE fica com **R$ 38,62 líquido**.

**Custo por assinante em cartão recorrente:** R$ 1,99 + R$ 0,49 = **R$ 2,48**. Líquido **R$ 37,42**.

---

## 6. App Android (Play Store)

### Recomendação
**PWA + wrapper Capacitor** (não app nativo do zero).

**Por quê:**
- O clube é 90% leitura de conteúdo e vídeo — não precisa de nativo puro.
- Um único código serve site + app (economiza tempo brutal).
- Publicação na Play Store é permitida (Google aceita PWA embrulhado desde 2018).
- Push notification funciona via OneSignal.

**Custos:**
- Play Console: **US$ 25 (uma vez só, não é anual)**. Nota: o Rafa mencionou R$ 125/ano na reunião — na verdade é taxa **única** de US$ 25.
- App Store: **US$ 99/ano** (pós-MVP).
- **Exigência da Google desde nov/2023:** 12 beta-testers ativos por 14 dias antes de publicar app novo. Já embutido no cronograma na Semana 8.

**Alternativas:**
- React Native (mais nativo, mais trabalho, sem retorno tangível no MVP).
- Flutter (idem).
- App só web (sem publicar em loja) — perde credibilidade e discovery.

---

## 7. Gerenciador de Conteúdos

### Recomendação
**Painel próprio dentro do Orquestrador**, integrado com:
- **Canva API** (ou geração de imagem via templates fixos + a IA que a Cris chama de "Cléber") — gera os posts prontos.
- **Buffer** ou **Metricool** — agendamento em múltiplas redes (R$ 30-60/mês).
- **Resend** ou **Mailchimp (free até 500 contatos)** — e-mail marketing.

**Custo estimado:** R$ 0-60/mês no primeiro semestre.

---

## 8. Orquestrador (Dashboard)

Sem plataforma externa. **Custom sobre o mesmo Next.js/Supabase**, aproveitando que todos os dados do clube já estão no mesmo banco.

Views iniciais:
- Hoje (novos assinantes hoje, receita hoje, alertas).
- Financeiro (MRR, ARR, churn, LTV estimado).
- Conteúdo (posts agendados, engajamento por post, próximos episódios).
- Leads (formulário do site, com pipeline básico).
- Assinantes (busca, filtros, ações — cancelar, dar cortesia).

---

## 9. Estimativa consolidada de custos mensais

### Cenário MVP (0 assinantes)
| Item | R$/mês |
|---|---|
| Hospedagem + e-mails (Hostinger) | 30 |
| Vercel (site + clube) | 0 |
| Supabase | 0 |
| Asaas | 0 (só taxa por transação) |
| Buffer/Metricool | 30 |
| **Total** | **~R$ 60/mês** |
| Play Store (única vez) | R$ ~140 (US$ 25) |

### Cenário 100 assinantes (~R$ 4.000 MRR)
| Item | R$/mês |
|---|---|
| Hospedagem + e-mails | 30 |
| Vercel Pro (opcional) | 100 |
| Supabase Pro | 125 |
| Taxa Asaas (~média 3%) | ~120 |
| Buffer/Metricool | 60 |
| Mailchimp starter | 65 |
| **Total** | **~R$ 500/mês** |
| **Margem bruta** | **~R$ 3.500 (87%)** |

### Cenário 1.000 assinantes (~R$ 40.000 MRR)
- Custos infra crescem para ~R$ 1.500-2.000/mês.
- Taxa gateway: ~R$ 1.200.
- **Total: ~R$ 3.500/mês. Margem bruta: R$ 36.500 (91%).**

**Conclusão:** stack recomendado escala com margem crescente. É o poder do SaaS.

---

## 10. O que apresentar no kickoff (versão para Cris/Gio)

Sem jargão. Só:

1. **Hospedagem e e-mails corporativos:** vou contratar a Hostinger (~R$ 30/mês), fica tudo no mesmo lugar do domínio de vocês.
2. **Site institucional:** faço custom, moderno, rápido. Vocês editam textos por um painel simples.
3. **Clube HCE:** vou fazer sob medida, com controle total. Começamos com 1 plano só (~R$ 40/mês) e uma promoção pra "fundadores". Vocês só publicam ficha, o resto do fluxo é automático.
4. **Pagamentos:** Asaas — recebe PIX, cartão recorrente, boleto, gera nota fiscal automática, tudo em conta PJ de vocês.
5. **App:** publico na Play Store por vocês (custo único de US$ 25 / ~R$ 140).
6. **Gerenciador de posts:** painel único onde vocês veem tudo — leads, assinantes, receita, posts programados, agenda de podcast.
7. **Custo mensal fixo pro MVP:** ~R$ 60/mês. Sobe conforme o negócio crescer, mas sempre proporcional à receita.
