# Passo a passo — E-mail profissional no Zoho Mail (hcegastronomia.com)

Objetivo: criar 3 caixas de e-mail no domínio `hcegastronomia.com`, de graça, usando o
**Zoho Mail (plano Forever Free)**, com o DNS gerenciado na **Cloudflare**.

Caixas a criar:
- `gio.gropello@hcegastronomia.com`
- `cris.leite@hcegastronomia.com`
- `contato@hcegastronomia.com`

O plano grátis do Zoho permite **até 5 usuários** (5GB cada), **1 domínio**, com acesso por
**webmail e app de celular** (não tem IMAP/POP/Outlook no grátis). Para 3 caixas está perfeito.

> Importante: todos os registros abaixo entram na **Cloudflare** (Dashboard do
> `hcegastronomia.com` > DNS > Records). Registros de e-mail (MX/TXT) ficam sempre como
> **"DNS only"** (nuvem cinza), nunca "Proxied" (nuvem laranja).

---

## Etapa 1 — Criar a conta Zoho no plano grátis

1. Acesse **https://www.zoho.com/mail/** e clique em **Sign Up**.
2. Role a página de planos até o final e escolha o **Forever Free Plan** (fica embaixo dos
   planos pagos; se aparecer só planos pagos, procure "Forever Free" ou o link
   "Try now"/"Sign up for free"). **Não** pegue trial pago.
3. Escolha a opção **"Sign up with a domain I already own"** e informe `hcegastronomia.com`.
4. Crie o usuário administrador. Sugestão: use o `contato@hcegastronomia.com` como conta
   admin (ou o Gmail temporário que já usamos para a Cloudflare — tanto faz para o admin).

---

## Etapa 2 — Provar que o domínio é seu (verificação)

O Zoho vai pedir para adicionar **1 registro** de verificação. Ele mostra um valor único
(algo como `zoho-verification=zbXXXXXXXX.zmverify.zoho.com` ou um CNAME).

Na **Cloudflare** (DNS > Records > Add record):
- Se o Zoho pedir **TXT**:
  - Type: `TXT`
  - Name: `@`
  - Content: cole o valor exato que o Zoho mostrou (ex.: `zoho-verification=...`)
  - TTL: Auto
- Se o Zoho pedir **CNAME**:
  - Type: `CNAME`
  - Name: o host que o Zoho indicar (ex.: `zb14567890`)
  - Target: `zmverify.zoho.com`
  - Proxy status: **DNS only** (nuvem cinza)

Volte ao Zoho e clique **Verify**. Costuma validar em minutos.

---

## Etapa 3 — Criar as 3 caixas de e-mail

Ainda no assistente do Zoho, na etapa **"Create users/mailboxes"**, crie:
- `gio.gropello`
- `cris.leite`
- `contato`

(O domínio `@hcegastronomia.com` já vem preenchido.) Defina uma senha inicial para cada
uma; cada pessoa troca depois no primeiro acesso.

> Alternativa: uma pessoa pode ser "usuário" e as outras "aliases", mas como o grátis dá 5
> usuários, o mais simples é criar as 3 como usuários de verdade (cada uma com sua caixa e login).

---

## Etapa 4 — MX records (fazer o e-mail chegar)

Na **Cloudflare** (DNS > Records), adicione os **3 MX** do Zoho. Antes, **apague qualquer
MX antigo** que exista (a zona importada do HostGator tinha um MX apontando para o próprio
domínio — remova-o).

| Type | Name | Mail server / Content | Priority |
|------|------|-----------------------|----------|
| MX   | `@`  | `mx.zoho.com`         | 10       |
| MX   | `@`  | `mx2.zoho.com`        | 20       |
| MX   | `@`  | `mx3.zoho.com`        | 50       |

(Confirme os nomes exatos na tela do Zoho — em alguns data centers ele mostra `mx.zohomail.com`.
Use exatamente o que o painel do Zoho exibir.)

---

## Etapa 5 — SPF, DKIM e DMARC (não cair em spam)

Todos são **TXT** na Cloudflare.

### SPF (autoriza o Zoho a enviar pelo seu domínio)
- Type: `TXT`
- Name: `@`
- Content: `v=spf1 include:zoho.com ~all`
- Só pode existir **1** registro SPF no domínio. Se já houver um, edite em vez de criar outro.

### DKIM (assina os e-mails)
1. No Zoho: **Admin Console > Domains > (seu domínio) > Email Configuration > DKIM**.
2. Crie um seletor (ex.: `zmail`) — o Zoho gera um valor grande (a chave pública).
3. Na Cloudflare:
   - Type: `TXT`
   - Name: `zmail._domainkey`  (use o seletor que o Zoho indicar)
   - Content: cole a chave que o Zoho mostrou (começa com `v=DKIM1; k=rsa; p=...`)
4. Volte ao Zoho e clique em **Verify** no DKIM.

### DMARC (política de proteção — recomendado)
- Type: `TXT`
- Name: `_dmarc`
- Content: `v=DMARC1; p=none; rua=mailto:contato@hcegastronomia.com`
- (Começamos com `p=none` só monitorando; depois podemos endurecer para `quarantine`.)

---

## Etapa 6 — Testar

1. Acesse **https://mail.zoho.com** e entre com uma das caixas (ex.: `contato@`).
2. Envie um e-mail de teste para um Gmail seu e responda de volta.
3. Confira em https://mxtoolbox.com (busque por `hcegastronomia.com`) se MX, SPF e DKIM
   aparecem corretos.

Propagação do DNS: normalmente minutos, podendo levar algumas horas.

---

## Observações

- **Gmail como cliente:** no grátis não há IMAP/POP, então não dá para puxar no app Gmail
  padrão. Usa-se o **webmail do Zoho** (mail.zoho.com) e o **app Zoho Mail** (Android/iOS).
  Se um dia quiserem usar o Gmail/Outlook como cliente, aí sim seria um plano pago do Zoho
  (Mail Lite, ~US$1/usuário/mês) que libera IMAP.
- **Encaminhamento:** dá para configurar cada caixa para reencaminhar cópia para um Gmail
  pessoal, se preferirem ler tudo num lugar só (Settings > Mail Forwarding no Zoho).
- Nada disso mexe no site (Vercel) nem no banco (Neon). É só DNS de e-mail.
