# Passo a passo para o Fabio, trocar os nameservers do hcegastronomia.com para a Cloudflare

## O que é e por que

Vamos passar o gerenciamento de DNS do domínio **hcegastronomia.com** para a **Cloudflare**.
Isso deixa o controle do domínio flexível e independente da hospedagem.

**Você NÃO precisa:** contratar nada, cancelar nada, transferir o domínio nem mexer
em e-mail. É só **trocar os servidores de nome (nameservers)** dentro do HostGator.
Leva uns 5 minutos. A mudança propaga em algumas horas.

## Os dois nameservers que devem ficar (Cloudflare)

```
cris.ns.cloudflare.com
megan.ns.cloudflare.com
```

## Os que devem ser removidos (atuais)

```
dns3.hostgator.com.br
dns4.hostgator.com.br
```

## Passo a passo no HostGator

1. Acesse a **Central do Cliente** do HostGator e faça login:
   `https://cliente.hostgator.com.br` (ou o portal que você usa para o domínio).

2. No menu, clique em **Domínios** (pode aparecer como "Meus Domínios" ou
   "Gerenciador de Domínios").

3. Na lista, clique no domínio **hcegastronomia.com** (ou no botão **Gerenciar** ao
   lado dele).

4. Procure a seção de **Servidores de Nome** (pode aparecer como "Nameservers",
   "Servidores DNS" ou "Alterar DNS").

5. Selecione a opção de **usar servidores de nome personalizados**
   (às vezes escrito como "Custom" ou "Definir nameservers manualmente").

6. **Apague** os nameservers atuais (`dns3.hostgator.com.br` e `dns4.hostgator.com.br`)
   e **digite os dois da Cloudflare**:
   - Servidor 1: `cris.ns.cloudflare.com`
   - Servidor 2: `megan.ns.cloudflare.com`
   - Se houver campos para um 3o e 4o servidor, **deixe em branco**.

7. Clique em **Salvar / Confirmar**.

8. **DNSSEC:** se em algum lugar da tela do domínio existir uma opção chamada
   **DNSSEC** e ela estiver **ativada**, **desative**. (Normalmente já vem desligada.)
   Isso é importante: com DNSSEC ligado, a troca de nameservers pode derrubar o domínio.

## O que NÃO fazer

- Não cancelar, transferir nem excluir o domínio.
- Não alterar os dados de titularidade/registro.
- Não configurar e-mail nem hospedagem.
- Não mexer no **hcegastronomia.com.br** (esse é outro registrador, registro.br;
  fica para depois).

## Confirmação

Depois de salvar, **tira um print da tela mostrando os nameservers salvos**
(`cris.ns.cloudflare.com` e `megan.ns.cloudflare.com`) e manda pro Rafael.

Se em algum passo a tela estiver diferente do descrito, tira um print e manda que
a gente te diz exatamente onde clicar.

Valeu, Fabio!
