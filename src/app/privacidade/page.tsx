import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  type LegalSecao,
} from "@/components/site/legal-layout";
import {
  EMAIL_CONTATO,
  EMAIL_PRIVACIDADE,
  EMPRESA,
  LEGAL_ATUALIZACAO,
  LEGAL_VERSAO,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Aviso de Privacidade",
  description:
    "Aviso de Privacidade da HCE Gastronomia: quais dados pessoais tratamos, com quais finalidades e bases legais (LGPD), com quem compartilhamos e como exercer os seus direitos.",
  alternates: { canonical: "/privacidade" },
  openGraph: {
    title: "Aviso de Privacidade · HCE",
    description:
      "Como a HCE Gastronomia trata dados pessoais, em conformidade com a LGPD.",
    url: "/privacidade",
  },
};

const linkClasses =
  "font-semibold text-brand-blue underline underline-offset-2 transition-colors hover:text-brand-amber-dark";

function Identificacao() {
  const nome = EMPRESA.razaoSocial || EMPRESA.nomeFantasia;
  return (
    <>
      <strong>{nome}</strong>
      {EMPRESA.razaoSocial && EMPRESA.nomeFantasia !== EMPRESA.razaoSocial ? (
        <> (nome fantasia “{EMPRESA.nomeFantasia}”)</>
      ) : null}
      {EMPRESA.cnpj ? (
        <>, inscrita no CNPJ sob o nº {EMPRESA.cnpj}</>
      ) : (
        <>
          {" "}
          <em>(inscrição no CNPJ a ser incluída)</em>
        </>
      )}
      {EMPRESA.endereco ? <>, com sede em {EMPRESA.endereco}, </> : <>, </>}
      {EMPRESA.cidadeUf} — {EMPRESA.pais}
    </>
  );
}

const SECOES: LegalSecao[] = [
  {
    id: "controlador",
    titulo: "Quem trata os seus dados e como falar conosco",
    conteudo: (
      <>
        <p>
          A <Identificacao /> é a <strong>controladora</strong> dos dados
          pessoais tratados no site {SITE_NAME}, nos termos da Lei Geral de
          Proteção de Dados Pessoais (Lei nº 13.709/2018 — “LGPD”).
        </p>
        <p>
          Este Aviso explica, de forma transparente, quais dados coletamos, por
          que os utilizamos, com quem os compartilhamos, por quanto tempo os
          guardamos e quais são os seus direitos. Para qualquer assunto
          relacionado à privacidade, fale com{" "}
          {EMPRESA.encarregado ? (
            <>
              o(a) nosso(a) Encarregado(a) pelo Tratamento de Dados,{" "}
              <strong>{EMPRESA.encarregado}</strong>,{" "}
            </>
          ) : (
            <>o nosso canal de privacidade </>
          )}
          pelo e-mail{" "}
          <a href={`mailto:${EMAIL_PRIVACIDADE}`} className={linkClasses}>
            {EMAIL_PRIVACIDADE}
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "definicoes",
    titulo: "Definições",
    conteudo: (
      <ul>
        <li>
          <strong>Dado pessoal:</strong> informação relacionada a pessoa natural
          identificada ou identificável.
        </li>
        <li>
          <strong>Titular:</strong> a pessoa natural a quem os dados se referem —
          você.
        </li>
        <li>
          <strong>Tratamento:</strong> toda operação com dados (coleta, uso,
          armazenamento, compartilhamento, eliminação etc.).
        </li>
        <li>
          <strong>Controlador:</strong> quem decide sobre o tratamento (a HCE).
        </li>
        <li>
          <strong>Operador:</strong> quem trata dados em nome do controlador (os
          nossos fornecedores de tecnologia).
        </li>
        <li>
          <strong>Base legal:</strong> a hipótese da LGPD que autoriza cada
          tratamento (art. 7º).
        </li>
      </ul>
    ),
  },
  {
    id: "dados-coletados",
    titulo: "Quais dados coletamos",
    conteudo: (
      <>
        <p>
          <strong>a) Dados que você nos fornece</strong>
        </p>
        <ul>
          <li>
            <strong>Cadastro de conta:</strong> nome, e-mail e senha (armazenada
            de forma cifrada, jamais em texto puro). Opcionalmente, telefone e um
            nome de usuário público (@handle).
          </li>
          <li>
            <strong>Perfil:</strong> se você preencher, biografia, foto (avatar),
            telefone, endereço (CEP, logradouro, número, complemento, bairro,
            cidade, estado, país) e links de redes sociais.
          </li>
          <li>
            <strong>Formulário “Fale com a HCE”:</strong> nome, e-mail, mensagem
            e, opcionalmente, telefone, além das suas preferências de contato
            (e-mail, telefone, WhatsApp).
          </li>
          <li>
            <strong>“Quero ser avisado” (+HCE):</strong> nome, e-mail, telefone e
            preferências de canal (e-mail, SMS, WhatsApp) e de promoções.
          </li>
          <li>
            <strong>Feed:</strong> o texto dos seus comentários e as suas
            reações a artigos.
          </li>
          <li>
            <strong>Métricas de leitura do Feed:</strong> quando você, já
            autenticado, acessa o Feed ou um artigo, registramos o acesso
            vinculado à sua conta, o artigo lido e o tempo aproximado de
            permanência na página, para fins de audiência e melhoria do
            conteúdo.
          </li>
        </ul>
        <p>
          <strong>b) Dados coletados automaticamente</strong>
        </p>
        <ul>
          <li>
            <strong>Navegação/analytics:</strong> páginas visitadas e um
            identificador anônimo de visitante (cookie), além de dados
            aproximados de localização (cidade/país/região) fornecidos pela
            infraestrutura. <em>Não</em> armazenamos o seu endereço IP nesse
            registro de navegação.
          </li>
          <li>
            <strong>Segurança:</strong> ao enviar formulários públicos (contato e
            “avise-me”), registramos o endereço IP e o navegador (user-agent)
            para prevenção a fraudes e abusos.
          </li>
          <li>
            <strong>Cookies:</strong> ver a seção “Cookies”.
          </li>
        </ul>
        <p>
          <strong>c) Dados recebidos de terceiros</strong>
        </p>
        <ul>
          <li>
            <strong>Login com Google:</strong> se você optar por entrar com o
            Google, recebemos o seu nome, e-mail, a confirmação de e-mail
            verificado e um identificador da conta Google. Guardamos também os
            tokens de autenticação necessários à integração.
          </li>
        </ul>
        <p>
          Não coletamos intencionalmente dados pessoais sensíveis. Pedimos que
          você não os inclua em campos livres (como mensagens e comentários).
        </p>
      </>
    ),
  },
  {
    id: "finalidades",
    titulo: "Por que usamos os seus dados (finalidades e bases legais)",
    conteudo: (
      <>
        <p>Tratamos os seus dados para as seguintes finalidades:</p>
        <ul>
          <li>
            <strong>Criar e manter a sua conta</strong> e permitir a
            autenticação (inclusive login social). <em>Base legal:</em> execução
            de contrato (art. 7º, V).
          </li>
          <li>
            <strong>Verificar o seu e-mail e permitir a redefinição de senha.</strong>{" "}
            <em>Base legal:</em> execução de contrato e legítimo interesse em
            segurança (art. 7º, V e IX).
          </li>
          <li>
            <strong>Responder aos seus contatos</strong> e conduzir tratativas
            comerciais preliminares. <em>Base legal:</em> procedimentos
            preliminares/legítimo interesse e, quanto aos canais de contato
            escolhidos, consentimento (art. 7º, V, IX e I).
          </li>
          <li>
            <strong>Avisar sobre o lançamento do +HCE</strong> e enviar
            comunicações de marketing quando você autoriza. <em>Base legal:</em>{" "}
            consentimento (art. 7º, I).
          </li>
          <li>
            <strong>Publicar e moderar comentários e reações</strong> no Feed.{" "}
            <em>Base legal:</em> execução de contrato e legítimo interesse (art.
            7º, V e IX).
          </li>
          <li>
            <strong>Garantir a segurança</strong> (prevenção a fraudes, abuso e
            ataques): verificação anti-robô (reCAPTCHA), limitação de requisições
            e registros de segurança. <em>Base legal:</em> legítimo interesse
            (art. 7º, IX).
          </li>
          <li>
            <strong>Medir audiência e melhorar o site</strong> com métricas
            agregadas de navegação. <em>Base legal:</em> legítimo interesse (art.
            7º, IX).
          </li>
          <li>
            <strong>Medir a leitura do Feed</strong> (artigos acessados e tempo
            de permanência, vinculados à conta) para entender o interesse do
            público e aprimorar o conteúdo. <em>Base legal:</em> legítimo
            interesse (art. 7º, IX).
          </li>
          <li>
            <strong>Cumprir obrigações legais</strong> e exercer direitos em
            processos. <em>Base legal:</em> obrigação legal e exercício regular de
            direitos (art. 7º, II e VI).
          </li>
        </ul>
        <p>
          Quando o tratamento se apoiar em legítimo interesse, adotamos medidas
          para equilibrar esse interesse com os seus direitos e liberdades.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    titulo: "Cookies e tecnologias semelhantes",
    conteudo: (
      <>
        <p>
          Dividimos os cookies em <strong>necessários</strong> (indispensáveis
          ao funcionamento) e de <strong>estatística</strong> (opcionais, só
          usados mediante o seu consentimento). Na primeira visita mostramos um
          aviso onde você pode <strong>aceitar</strong>, <strong>rejeitar</strong>{" "}
          ou <strong>configurar</strong> por categoria. Você pode mudar ou
          retirar a sua escolha a qualquer momento pelo ícone de cookies no
          canto inferior da tela.
        </p>
        <p>
          <strong>a) Necessários</strong> (sempre ativos):
        </p>
        <ul>
          <li>
            <strong>hce_sess</strong> — mantém a sua sessão de usuário logado.
            Duração: até 30 dias.
          </li>
          <li>
            <strong>hce_adm</strong> — sessão do painel administrativo (restrito
            à equipe). Duração: até 8 horas.
          </li>
          <li>
            <strong>hce_goauth</strong> — segurança do login com Google (proteção
            contra CSRF). Duração: cerca de 10 minutos.
          </li>
          <li>
            <strong>hce_consent</strong> — guarda a sua preferência de cookies.
            Duração: cerca de 6 meses.
          </li>
          <li>
            <strong>reCAPTCHA</strong> (Google) — proteção antifraude nos
            formulários; carregado apenas nas páginas com formulário.
          </li>
        </ul>
        <p>
          <strong>b) Estatística</strong> (opcionais — só com consentimento):
        </p>
        <ul>
          <li>
            <strong>hce_vid</strong> — identificador anônimo de visitante para
            métricas de audiência de primeira parte (contagem de visitas e
            cidades). Duração: até 1 ano. <em>Só é criado se você autorizar a
            categoria “Estatísticas”.</em>
          </li>
        </ul>
        <p>
          Não utilizamos cookies de publicidade comportamental nem rastreadores
          de terceiros. As nossas métricas de audiência são de primeira parte e
          não armazenam o seu IP. Ao utilizar recursos como o reCAPTCHA e as
          fontes do Google (Google Fonts), o seu navegador se comunica com a
          Google, que pode tratar dados conforme as suas próprias políticas.
          Você também pode bloquear ou apagar cookies nas configurações do
          navegador, ciente de que recursos essenciais (como o login) podem
          deixar de funcionar.
        </p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    titulo: "Com quem compartilhamos os seus dados",
    conteudo: (
      <>
        <p>
          Não vendemos os seus dados. Compartilhamos dados pessoais apenas com
          operadores que nos ajudam a prestar o serviço, sob contrato e limitados
          às finalidades deste Aviso:
        </p>
        <ul>
          <li>
            <strong>Neon</strong> — banco de dados (PostgreSQL) onde os registros
            são armazenados.
          </li>
          <li>
            <strong>Vercel</strong> — hospedagem e entrega do site (CDN).
          </li>
          <li>
            <strong>Brevo</strong> — envio de e-mails transacionais (verificação
            de e-mail, redefinição de senha) e, quando autorizado, de marketing.
          </li>
          <li>
            <strong>Cloudflare</strong> — armazenamento de mídias (R2), DNS e
            roteamento de e-mail.
          </li>
          <li>
            <strong>Google</strong> — login social (OAuth), verificação anti-robô
            (reCAPTCHA) e fontes (Google Fonts).
          </li>
          <li>
            <strong>Sentry</strong> — monitoramento de erros e estabilidade da
            aplicação.
          </li>
          <li>
            <strong>ViaCEP</strong> — consulta de endereço a partir do CEP, no
            preenchimento do perfil.
          </li>
          <li>
            <strong>Provedores de pagamento</strong> — quando o +HCE estiver
            disponível, para processar assinaturas.
          </li>
        </ul>
        <p>
          Também poderemos compartilhar dados para cumprir obrigação legal ou
          ordem de autoridade competente, e no âmbito de eventual reorganização
          societária, sempre preservando a confidencialidade.
        </p>
      </>
    ),
  },
  {
    id: "transferencia-internacional",
    titulo: "Transferência internacional de dados",
    conteudo: (
      <p>
        Alguns dos nossos operadores estão sediados ou processam dados fora do
        Brasil (por exemplo, nos Estados Unidos e na União Europeia). Nesses
        casos, a transferência internacional observa a LGPD (art. 33 e
        seguintes), com a adoção de salvaguardas contratuais e técnicas
        adequadas para proteger os seus dados no mesmo nível assegurado no
        Brasil.
      </p>
    ),
  },
  {
    id: "retencao",
    titulo: "Por quanto tempo guardamos os seus dados",
    conteudo: (
      <>
        <p>
          Guardamos os dados apenas pelo tempo necessário às finalidades para as
          quais foram coletados, observados prazos legais, por exemplo:
        </p>
        <ul>
          <li>
            <strong>Dados de conta:</strong> enquanto a conta existir; após o
            encerramento, eliminamos ou anonimizamos, ressalvadas retenções
            legais.
          </li>
          <li>
            <strong>Contatos e leads:</strong> pelo tempo necessário ao
            atendimento e à relação, ou até você solicitar a exclusão/revogar o
            consentimento.
          </li>
          <li>
            <strong>Registros de segurança/acesso:</strong> conforme necessário à
            segurança e ao cumprimento do Marco Civil da Internet (Lei nº
            12.965/2014).
          </li>
        </ul>
        <p>
          Encerrada a necessidade, os dados são eliminados de forma segura, salvo
          hipóteses de guarda autorizadas pela LGPD (art. 16).
        </p>
      </>
    ),
  },
  {
    id: "seguranca",
    titulo: "Como protegemos os seus dados",
    conteudo: (
      <p>
        Adotamos medidas técnicas e organizacionais para proteger os dados, tais
        como: senhas armazenadas com algoritmo de derivação de chave (hash com
        sal), conexões cifradas (HTTPS), controle de acesso ao painel
        administrativo com contas individuais e trilha de auditoria, bloqueio
        temporário após tentativas de acesso inválidas, verificação anti-robô,
        limitação de requisições e sanitização de conteúdo contra código
        malicioso. Nenhum sistema é totalmente imune a incidentes; em caso de
        incidente de segurança relevante, atuaremos conforme a LGPD, inclusive
        com a comunicação à ANPD e aos titulares quando cabível.
      </p>
    ),
  },
  {
    id: "direitos",
    titulo: "Os seus direitos como titular",
    conteudo: (
      <>
        <p>
          A LGPD garante a você, a qualquer momento e mediante requisição, os
          seguintes direitos (art. 18):
        </p>
        <ul>
          <li>confirmação da existência de tratamento;</li>
          <li>acesso aos dados;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>
            anonimização, bloqueio ou eliminação de dados desnecessários,
            excessivos ou tratados em desconformidade;
          </li>
          <li>portabilidade a outro fornecedor, mediante requisição expressa;</li>
          <li>
            eliminação dos dados tratados com base no consentimento;
          </li>
          <li>
            informação sobre as entidades com as quais compartilhamos dados;
          </li>
          <li>
            informação sobre a possibilidade de não fornecer consentimento e as
            consequências;
          </li>
          <li>revogação do consentimento; e</li>
          <li>oposição a tratamento em desconformidade com a lei.</li>
        </ul>
        <p>
          Para exercer os seus direitos, escreva para{" "}
          <a href={`mailto:${EMAIL_PRIVACIDADE}`} className={linkClasses}>
            {EMAIL_PRIVACIDADE}
          </a>
          . Podemos precisar confirmar a sua identidade antes de atender ao
          pedido, para a sua própria segurança. Responderemos nos prazos legais.
          Você também pode, na sua conta, editar dados de perfil e remover o
          avatar; e cancelar comunicações de marketing pelo link de descadastro.
        </p>
      </>
    ),
  },
  {
    id: "menores",
    titulo: "Dados de crianças e adolescentes",
    conteudo: (
      <p>
        O site destina-se a maiores de 18 anos. Não coletamos intencionalmente
        dados de crianças e adolescentes sem o consentimento e no melhor
        interesse deles, na forma do art. 14 da LGPD. Se você acredita que um
        menor nos forneceu dados sem a devida autorização, contate-nos para que
        possamos eliminá-los.
      </p>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Alterações deste Aviso",
    conteudo: (
      <p>
        Este Aviso pode ser atualizado para refletir mudanças em nossas
        práticas, na tecnologia ou na legislação. A versão vigente é sempre a
        publicada nesta página, com a data de atualização indicada. Alterações
        relevantes poderão ser comunicadas por meios adicionais.
      </p>
    ),
  },
  {
    id: "encarregado",
    titulo: "Encarregado, contato e Autoridade Nacional",
    conteudo: (
      <p>
        Para dúvidas, solicitações ou reclamações sobre privacidade e proteção de
        dados, fale com{" "}
        {EMPRESA.encarregado ? (
          <>
            o(a) Encarregado(a) <strong>{EMPRESA.encarregado}</strong>, pelo
            e-mail{" "}
          </>
        ) : (
          <>o nosso canal de privacidade pelo e-mail </>
        )}
        <a href={`mailto:${EMAIL_PRIVACIDADE}`} className={linkClasses}>
          {EMAIL_PRIVACIDADE}
        </a>{" "}
        (ou{" "}
        <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
          {EMAIL_CONTATO}
        </a>
        ). Caso entenda que os seus direitos não foram atendidos, você pode
        também apresentar reclamação à Autoridade Nacional de Proteção de Dados
        (ANPD).
      </p>
    ),
  },
];

export default function PrivacidadePage() {
  return (
    <LegalLayout
      eyebrow="Privacidade"
      titulo="Aviso de Privacidade"
      resumo="A sua privacidade importa. Aqui explicamos, de forma clara, quais dados pessoais tratamos, por quê, com quem os compartilhamos e como você pode exercer os seus direitos — em conformidade com a LGPD."
      atualizacao={LEGAL_ATUALIZACAO}
      versao={LEGAL_VERSAO}
      secoes={SECOES}
      rodape={
        <>
          Documento vigente desde {LEGAL_ATUALIZACAO} (versão {LEGAL_VERSAO}).
          Este Aviso integra os{" "}
          <Link href="/termos-de-uso" className={linkClasses}>
            Termos de Uso
          </Link>{" "}
          da HCE.
        </>
      }
    />
  );
}
