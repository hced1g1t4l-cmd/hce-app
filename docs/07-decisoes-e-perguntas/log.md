# Log de Decisões e Perguntas em Aberto

> Arquivo vivo. Toda decisão tomada e toda pergunta que aparece durante o projeto vai para cá.

---

## Decisões tomadas

| Data | Decisão | Contexto |
|---|---|---|
| 10/07/2026 | Projeto tem **4 entregáveis integrados** (site, SaaS, gerenciador de conteúdos, orquestrador) — não é só site institucional. | Insight do Rafa na reunião. Cris/Gio concordaram. |
| 10/07/2026 | **MVP até 12/09/2026** (~9 semanas). | Cronograma proposto por Rafa no e-mail de briefing. |
| 10/07/2026 | Começar por **app Android** (Play Store — R$ 125/ano), iPhone (App Store — US$ 99/ano) depois do MVP. | Custo menor e publicação mais rápida. |
| 10/07/2026 | Play Store exige **12 beta-testers** antes de liberar publicação — vai ser feito na Semana 8 (29/08-04/09). | Requisito da Google. |
| 10/07/2026 | Reunião semanal proposta: **quartas às 18h**. Primeiro kickoff proposto para 16/07 às 18h. | E-mail de briefing. |
| 10/07/2026 | Comunicação diária via **grupo de WhatsApp "hce - Projeto Digital"** (Rafa cria em até 24h). | E-mail de briefing. |
| 10/07/2026 | Materiais brutos ficam em **Google Drive compartilhado** (link já criado). | https://drive.google.com/drive/folders/1bsPoyjYHYDgX-KHgC4CjZyX1xHO7lnt6 |
| 10/07/2026 | Respostas do briefing devem ser **humanas, sem IA generativa**. | Pedido explícito do Rafa. |
| 10/07/2026 | Stack técnico proposto (a validar no kickoff): **Hostinger** (host + e-mails) + **Next.js/Vercel** (site) + **Next.js + Supabase** (Clube HCE custom) + **Asaas** (pagamentos BR) + **PWA/Capacitor** (app Android). | Detalhes em `docs/08-recomendacoes-tecnicas/stack-e-fornecedores.md`. |
| 24/07/2026 | **Arquitetura/stack confirmada** (atualiza a linha acima): Next.js unificado (site + SaaS) na **Vercel**, **PostgreSQL/Neon** + Prisma, **Payload CMS**, **Auth.js**, **Stripe** (início), **Bunny/R2** (mídia), **Zoho Mail** (e-mail) e **Cloudflare** (DNS). **Hospedagem compartilhada dispensada** no MVP; único custo externo agora é o domínio. | Rafael seguiu as recomendações. Detalhe em `hce-decisao-arquitetura.md` (raiz do workspace). |
| 25/07/2026 | **Domínio principal: `hcegastronomia.com`** (HostGator). O **`hcegastronomia.com.br`** (registro.br) fica como **redirect 301 para o `hcegastronomia.com`**: quem acessar o `.com.br` é direcionado automaticamente para o `.com`. DNS dos dois será gerenciado na **Cloudflare**. | Melhor para marca e produto digital, escala global e evita conteúdo duplicado no SEO. Credenciais do HostGator e do registro.br já estão com o Rafael. |
| 25/07/2026 | **Correção de domínio.** Por engano foi adicionado o `hce.com` na Cloudflare, mas esse **não é** o domínio da HCE (teve dono anterior, aparentemente no México; registros herdados eram Network Solutions + Microsoft 365). O domínio correto é **`hcegastronomia.com`** (+ `.com.br`). Ação: remover o `hce.com` da Cloudflare, adicionar o `hcegastronomia.com`, pegar os nameservers da nova zona (podem diferir de `cris/megan.ns.cloudflare.com`) e conferir os registros antes de trocar. O passo a passo do Fabio será refeito com o domínio e os nameservers corretos. | Conferir no scan do `hcegastronomia.com` se há e-mail em uso (o briefing de 10/07 citava contato@, cris.leite@, gio.gropello@, financeiro@). |
| 25/07/2026 | `hce.com` removido da Cloudflare; **`hcegastronomia.com` adicionado**. Nameservers da Cloudflare: **`cris.ns.cloudflare.com`** e **`megan.ns.cloudflare.com`**. Nameservers atuais (a remover): **`dns3.hostgator.com.br`** e **`dns4.hostgator.com.br`** (confirma que o domínio está no HostGator). A troca será feita pelo **Fabio** no HostGator (passo a passo em `docs/08-recomendacoes-tecnicas/passo-a-passo-fabio-nameservers-hcegastronomia-com.md`). | **Pendente antes de virar:** conferir em DNS > Records da Cloudflare se os registros de e-mail (MX/mail/imap/smtp) foram importados e estão como "DNS only", para não derrubar e-mail que esteja em uso. |
| 25/07/2026 | **Nameservers do `hcegastronomia.com` trocados no HostGator (feito pelo Fabio) e salvos com sucesso.** HostGator confirmou "Domínio está configurado na plataforma de site: Outra plataforma de hospedagem", com `cris/megan.ns.cloudflare.com`. Propagação em curso (até 24h). | Próximo: clicar em "I updated my nameservers" na Cloudflare, aguardar status **Active**, e conferir DNS > Records (site/e-mail em uso?). Depois: apontar site (Vercel) e e-mail (Zoho). |
| 25/07/2026 | DNS Records conferidos: zona padrão do HostGator (A → `162.240.81.81`; CNAMEs `www/ftp/mail`; MX → próprio domínio), **sem site nem e-mail relevante em uso**. Rafael cogitou usar e-mail de hospedagem Hostinger, mas **decisão confirmada: seguir SEM hospedagem** — e-mail no **Zoho (grátis)**, site no **Vercel**, banco **Neon**, DNS **Cloudflare**. Mantém apenas o registro dos domínios (HostGator/registro.br); pode cancelar qualquer plano de hospedagem pago se houver. | Reafirma a decisão de arquitetura (nenhuma hospedagem compartilhada). Próximo, quando o domínio ficar Active: configurar e-mail no Zoho (MX + SPF/DKIM/DMARC na Cloudflare). |
| 25/07/2026 | **App no ar (infra de desenvolvimento).** Repositório GitHub criado e código enviado: `github.com/hced1g1t4l-cmd/hce-app` (branch `main`). Deploy na **Vercel** publicado (time `hcegastronomia`, plano Hobby/grátis): **`https://hce-app-self.vercel.app`**. Deploy automático a cada push no `main`. | Falta: criar banco no **Neon** (DATABASE_URL) + gerar **AUTH_SECRET** e adicionar nas env vars do Vercel; depois conectar o domínio `hcegastronomia.com` quando ficar Active. Subir para Vercel **Pro** só quando houver assinatura paga (uso comercial). |
| 25/07/2026 | **Banco Neon ligado.** Projeto `hce` (AWS us-east-2 / Ohio, plano grátis). Criados localmente (fora do Git): `.env` com `DATABASE_URL` e `.env.local` com `AUTH_SECRET`. `db:push` rodado com sucesso: tabelas `User/Account/Session/VerificationToken` (+ enum `Role`) criadas no Neon. Segredos ficam só na máquina; podem ser rotacionados no Neon/`npx auth secret` se necessário. | Falta: adicionar `DATABASE_URL` e `AUTH_SECRET` nas Environment Variables do Vercel (Production/Preview/Development) e redeploy. |
| 25/07/2026 | **Domínio `hcegastronomia.com` ATIVO na Cloudflare** (propagação concluída no mesmo dia). NS confirmados via `8.8.8.8` e `1.1.1.1`: `cris/megan.ns.cloudflare.com`. O registro A ainda proxia para a página antiga do HostGator (`162.240.81.81`). | Próximos: (1) apontar o domínio para o **Vercel** (Add Domain no Vercel + registros na Cloudflare, proxy DNS-only); (2) configurar **e-mail Zoho** (MX + SPF/DKIM/DMARC); (3) adicionar `hcegastronomia.com.br` como **redirect 301**. |
| 25/07/2026 | **Site apontado para o Vercel.** Na Cloudflare: removido o A antigo do HostGator; criado **CNAME `@` → `f4cf27d6fc563b21.vercel-dns-017.com`** e ajustado **CNAME `www`** para o mesmo alvo, ambos **DNS only**. Verificado por DNS: raiz e `www` resolvem para IPs do Vercel (`64.29.17.x`/`216.198.79.x`). Domínios adicionados no Vercel (`www` como principal por padrão; raiz 308→www). | Falta: Vercel validar (Refresh) e emitir SSL; adicionar `DATABASE_URL`+`AUTH_SECRET` nas env vars do Vercel; (opcional) inverter para raiz como principal; depois e-mail Zoho e redirect do `.com.br`. |
| 25/07/2026 | **SITE NO AR no domínio próprio.** Vercel com os 3 domínios em **"Valid Configuration"** (SSL emitido): `www.hcegastronomia.com` (principal, Production), `hcegastronomia.com` (redirect 308 → www) e `hce-app-self.vercel.app`. Confirmado abrindo no navegador: página "Fundação do ecossistema HCE". Infra de produção completa: GitHub → Vercel → domínio + HTTPS. | Próximos: (1) env vars no Vercel (`DATABASE_URL` do Neon + `AUTH_SECRET`) + redeploy, pro banco/login funcionarem em produção; (2) e-mail Zoho (MX/SPF/DKIM/DMARC na Cloudflare); (3) `hcegastronomia.com.br` como redirect 301. |
| 25/07/2026 | **Neon: adotada conexão pooled + directUrl (padrão Prisma/serverless).** `schema.prisma` agora tem `url` (pooled, `-pooler`, runtime) e `directUrl` (direta, migrações). `.env` local atualizado com `DATABASE_URL` (pooled) e `DIRECT_URL` (direta); `.env.example` documentado. `prisma db push` validado (em sync). | No Vercel, adicionar 4 env vars: `DATABASE_URL` (pooled), `DIRECT_URL` (direta), `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL=https://www.hcegastronomia.com`; depois Redeploy. |
| 25/07/2026 | **Env vars no Vercel adicionadas** (Production + Preview; Development dispensado — só serve p/ `vercel dev`, que não usamos). Variáveis marcadas como *Sensitive*. | Marcar só Production/Preview evita o erro de "sensitive" no Development. |
| 25/07/2026 | **Rota `/api/health` criada e no ar.** Checa app + `SELECT 1` no banco. Testada localmente: `{"status":"ok","db":"connected"}`. Commit `8ce19b0` + push no `main` → deploy automático na Vercel (aplica as env vars). | Validar em produção: abrir `https://www.hcegastronomia.com/api/health` e confirmar `"db":"connected"`. Fecha a fundação de infra. |
| 25/07/2026 | **E-mail: mudança de decisão — Zoho Free saiu, entra Cloudflare Email Routing (grátis).** O plano grátis do Zoho está descontinuado/oculto para novas contas no Brasil (site força pt-br e esconde; blog da Zoho confirma fim do Mail Free, empurra Mail Lite pago). Como já usamos Cloudflare para o DNS e o Rafael queria integração com Gmail, adotamos **Cloudflare Email Routing**: recebe `contato@`, `cris.leite@`, `gio.gropello@hcegastronomia.com` e encaminha para os Gmails. Envio "como @hcegastronomia.com" fica como fase 2 (Gmail "Enviar como" + SMTP relay grátis, ex.: Brevo). | Ativar em Cloudflare > (domínio) > Email > Email Routing: adiciona MX (`route1/2/3.mx.cloudflare.net`) + SPF; **remover o MX antigo do HostGator**. Verificar cada Gmail de destino (link de confirmação). Fase 1 = receber (resolve o botão de contato do site). |
| 25/07/2026 | **E-mail: (SUPERADO) plano inicial era 3 caixas no Zoho Forever Free.** `gio.gropello@`, `cris.leite@` e `contato@hcegastronomia.com`. Plano grátis do Zoho: até 5 usuários, 5GB cada, 1 domínio, webmail+app (sem IMAP/POP). Passo a passo salvo em `docs/08-recomendacoes-tecnicas/passo-a-passo-email-zoho-hcegastronomia.md`. | Registros na Cloudflare (DNS only): verificação (TXT/CNAME), MX (`mx/mx2/mx3.zoho.com` prio 10/20/50, apagar MX antigo do HostGator), SPF (`v=spf1 include:zoho.com ~all`), DKIM (seletor `zmail._domainkey`), DMARC (`_dmarc`, p=none). Sem IMAP no grátis → usar webmail/app Zoho (ou plano pago p/ Gmail como cliente). |
| 25/07/2026 | **Design system + home institucional no ar.** Identidade oficial aplicada (assets de `~/Downloads/HCE`): azul `#003288`, âmbar `#FFC027`, fontes Poppins/Inter, logos em `public/brand`. Criados componentes (Container, Button, Logo, SiteHeader, SiteFooter) e a home real (hero, sobre Cris+Gio, serviços h/c/e, Clube +HCE, contato `contato@hcegastronomia.com`). Build ok. Commit `b6db499` + push → deploy Vercel. | Copy dos serviços/clube extraída dos posts oficiais. Fotos das chefs são pesadas (6–10MB) — otimizadas pelo next/image, mas vale reexportar menores depois. Ver o resultado em `www.hcegastronomia.com` após o deploy. |
| 25/07/2026 | **✅ FUNDAÇÃO DE INFRA CONCLUÍDA.** `https://www.hcegastronomia.com/api/health` retornou `"db":"connected"` em produção. Confirmado: GitHub → Vercel (deploy automático) → domínio próprio + SSL → banco Neon conectado em produção (pooled) → env vars aplicadas → Auth.js pronto. | Próxima frente: desenvolvimento de produto — (1) design system (marca HCE), (2) site institucional, (3) autenticação/área de assinante. E, em paralelo/infra: e-mail Zoho e redirect do `.com.br`. |

---

## Perguntas em aberto para o Rafa

- [ ] **Anexo `image.png` do e-mail de 10/07 não foi encontrado no workspace** — pedir para reencaminhar / salvar em `docs/05-materiais-recebidos/`.
- [ ] Confirmar com Cris/Gio a **data do kickoff (16/07 às 18h)**.
- [ ] Criar o **grupo de WhatsApp** ainda hoje/amanhã.
- [ ] Pedir ao Fábio (ou à Cris/Gio) o **domínio comprado + credenciais** de acesso.

## Resolvidos

- ✅ **10/07** — `wesleyss@ciandt.com` que apareceu no fim do e-mail é resíduo (ficou solto, não era CC). Confirmado com Rafa. Sem ação.

---

## Perguntas em aberto para Cris & Gio

Toda a seção "Aguardando" do `docs/04-respostas-clientes/respostas-briefing.md` é uma pergunta em aberto. Aqui listamos apenas as **top prioridades** — sem essas respostas o projeto não avança:

**Blocantes para começar (Semana 1):**
1. Confirmação do **domínio comprado** + acesso.
2. **Logo em alta resolução** + paleta de cores.
3. **Nome oficial da empresa e significado de "HCE"**.
4. **Mini-bios dos sócios** + fotos.
5. **Lista de serviços** com descrições curtas.

**Blocantes para começar Semana 2 (wireframes):**
6. **Persona do clube** + preço mensal estimado.
7. **Estrutura de planos** (quantos, o que cada um contém).
8. **Formato preferido das fichas técnicas no clube** (PDF? online? vídeo?).
9. **Categorização das fichas técnicas** (setores).
10. **5-10 exemplos de fichas técnicas** no Drive.

**Blocantes para pagamento (Semana 3-4):**
11. **Conta PJ + banco** para receber recorrência.
12. Formas de pagamento aceitas (cartão / PIX / boleto).

---

## Riscos monitorados

| Risco | Impacto | Mitigação |
|---|---|---|
| Atraso em respostas do briefing | Empurra o MVP proporcionalmente | Cadência semanal + WhatsApp diário. |
| Site da Foodness inacessível (403) | Perda de referência principal | Cris/Gio mandam prints das telas que gostaram. |
| Fichas técnicas em formatos heterogêneos | Migração para o clube fica cara | Padronizar formato antes de começar o cadastro (Semana 5-6). |
| Play Store bloqueia app por falta de 12 beta-testers | Atrasa lançamento | Cris/Gio já começam a listar os 12 nomes a partir da Semana 5. |
| Cris/Gio sem tempo por consultorias pontuais | Atrasa respostas | Rafa oferece call de 15 min "sem preparação" para destravar. |
