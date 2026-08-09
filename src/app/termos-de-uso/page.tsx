import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  type LegalSecao,
} from "@/components/site/legal-layout";
import {
  EMAIL_CONTATO,
  EMPRESA,
  LEGAL_ATUALIZACAO,
  LEGAL_VERSAO,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description:
    "Termos de Uso da HCE Gastronomia: regras de acesso e utilização do site, das contas de usuário, do Feed e do clube +HCE.",
  alternates: { canonical: "/termos-de-uso" },
  openGraph: {
    title: "Termos de Uso · HCE",
    description:
      "Condições gerais de uso do site e dos serviços da HCE Gastronomia.",
    url: "/termos-de-uso",
  },
};

const linkClasses =
  "font-semibold text-brand-blue underline underline-offset-2 transition-colors hover:text-brand-amber-dark";

// Identificação da empresa (usa dados de EMPRESA; onde faltar, avisa em vez de
// inventar). Mesma lógica no Aviso de Privacidade.
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
    id: "aceitacao",
    titulo: "Aceitação dos Termos",
    conteudo: (
      <>
        <p>
          Estes Termos de Uso (“Termos”) regem o acesso e a utilização do site{" "}
          <a href={SITE_URL} className={linkClasses}>
            {SITE_URL}
          </a>{" "}
          e dos serviços digitais oferecidos por <Identificacao /> (“
          {SITE_NAME}”, “nós”).
        </p>
        <p>
          Ao acessar o site, criar uma conta, enviar um formulário ou de
          qualquer forma utilizar os nossos serviços, você declara que leu,
          compreendeu e concorda integralmente com estes Termos e com o{" "}
          <Link href="/privacidade" className={linkClasses}>
            Aviso de Privacidade
          </Link>
          , que é parte integrante deste documento. Caso não concorde, você não
          deve utilizar o site.
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
          <strong>Usuário:</strong> qualquer pessoa que acessa ou utiliza o
          site, com ou sem conta cadastrada.
        </li>
        <li>
          <strong>Conta:</strong> cadastro pessoal que permite acesso a
          funcionalidades restritas (perfil, comentários, reações e, futuramente,
          o clube +HCE).
        </li>
        <li>
          <strong>Feed:</strong> área editorial da HCE com artigos, notícias e
          conteúdos de gastronomia.
        </li>
        <li>
          <strong>+HCE:</strong> clube de assinatura da HCE, com conteúdos e
          benefícios exclusivos, a ser disponibilizado.
        </li>
        <li>
          <strong>Conteúdo do Usuário:</strong> comentários, reações e demais
          informações submetidas pelo Usuário.
        </li>
      </ul>
    ),
  },
  {
    id: "objeto",
    titulo: "Objeto e descrição dos serviços",
    conteudo: (
      <>
        <p>
          A HCE é uma iniciativa de hospitalidade, consultoria e educação em
          gastronomia. Por meio do site, disponibilizamos, entre outros:
        </p>
        <ul>
          <li>conteúdo institucional e informações sobre os nossos serviços;</li>
          <li>
            formulários de contato e de manifestação de interesse (“Fale com a
            HCE” e “Quero ser avisado”);
          </li>
          <li>o Feed editorial, com possibilidade de comentários e reações;</li>
          <li>
            contas de usuário e área de perfil; e, futuramente, o clube de
            assinatura +HCE.
          </li>
        </ul>
        <p>
          Os serviços de consultoria, cursos e mentorias podem ser objeto de
          contratos específicos, que prevalecem sobre estes Termos naquilo que
          com eles conflitarem.
        </p>
      </>
    ),
  },
  {
    id: "cadastro",
    titulo: "Cadastro e conta de usuário",
    conteudo: (
      <>
        <p>
          Para acessar determinadas funcionalidades, é necessário criar uma
          conta, informando dados como nome, e-mail e senha — ou autenticando-se
          por meio de sua conta Google (login social). Ao se cadastrar, você se
          compromete a:
        </p>
        <ul>
          <li>fornecer informações verdadeiras, exatas e atualizadas;</li>
          <li>
            ser maior de 18 (dezoito) anos ou estar devidamente representado/
            assistido por responsável legal;
          </li>
          <li>
            manter a confidencialidade de suas credenciais, sendo responsável por
            todas as atividades realizadas em sua conta; e
          </li>
          <li>
            comunicar-nos imediatamente qualquer uso não autorizado, pelo e-mail{" "}
            <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
              {EMAIL_CONTATO}
            </a>
            .
          </li>
        </ul>
        <p>
          A HCE poderá exigir a verificação do e-mail para liberar recursos como
          comentários. O tratamento dos seus dados é descrito no{" "}
          <Link href="/privacidade" className={linkClasses}>
            Aviso de Privacidade
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    id: "conduta",
    titulo: "Regras de conduta e uso aceitável",
    conteudo: (
      <>
        <p>Ao utilizar o site, você concorda em não:</p>
        <ul>
          <li>
            violar leis, direitos de terceiros ou estes Termos, nem publicar
            conteúdo ilícito, difamatório, discriminatório, obsceno ou que incite
            violência ou ódio;
          </li>
          <li>
            publicar spam, propaganda não autorizada, correntes ou conteúdo
            enganoso;
          </li>
          <li>
            infringir direitos de propriedade intelectual ou divulgar dados
            pessoais de terceiros sem autorização;
          </li>
          <li>
            tentar obter acesso não autorizado a sistemas, contas ou dados;
            realizar engenharia reversa, varreduras, raspagem automatizada
            (scraping) ou sobrecarregar a infraestrutura;
          </li>
          <li>
            burlar mecanismos de segurança, limitação de requisições
            (rate-limiting) ou verificação anti-robô (reCAPTCHA).
          </li>
        </ul>
        <p>
          O descumprimento poderá resultar em remoção de conteúdo, suspensão ou
          encerramento da conta, sem prejuízo das medidas legais cabíveis.
        </p>
      </>
    ),
  },
  {
    id: "conteudo-usuario",
    titulo: "Conteúdo do Usuário e moderação",
    conteudo: (
      <>
        <p>
          Você é o único responsável pelo Conteúdo do Usuário que publica
          (por exemplo, comentários no Feed). Ao submetê-lo, você declara possuir
          os direitos necessários e concede à HCE uma licença não exclusiva,
          gratuita e pelo prazo de proteção legal para armazenar, exibir,
          reproduzir e moderar esse conteúdo no âmbito do site.
        </p>
        <p>
          Os comentários passam por <strong>moderação</strong> e podem ser
          aprovados, editados no que toca a formatação, recusados ou removidos, a
          critério da HCE, especialmente quando violarem estes Termos. A HCE não
          se responsabiliza por opiniões emitidas por Usuários.
        </p>
      </>
    ),
  },
  {
    id: "propriedade",
    titulo: "Propriedade intelectual",
    conteudo: (
      <>
        <p>
          A marca “HCE”, o logotipo, os textos, imagens, artigos, o layout e
          demais elementos do site são de titularidade da HCE ou de seus
          licenciadores, protegidos pela legislação de propriedade intelectual e
          de direitos autorais (Lei nº 9.610/1998).
        </p>
        <p>
          É vedada a reprodução, distribuição ou uso comercial sem autorização
          prévia e por escrito. O uso do site não transfere ao Usuário qualquer
          direito sobre tais conteúdos, salvo o direito de acesso pessoal e não
          comercial aqui concedido.
        </p>
      </>
    ),
  },
  {
    id: "assinaturas",
    titulo: "Clube +HCE, assinaturas e pagamentos",
    conteudo: (
      <>
        <p>
          O clube <strong>+HCE</strong> será oferecido em planos, incluindo
          opção gratuita e planos pagos (mensais ou anuais). Quando disponível,
          aplicam-se as seguintes condições, sem prejuízo de regras específicas
          apresentadas no momento da contratação:
        </p>
        <ul>
          <li>
            <strong>Cobrança:</strong> os planos pagos poderão ser cobrados por
            cartão de crédito (de forma recorrente) ou PIX, conforme opções
            disponíveis no checkout.
          </li>
          <li>
            <strong>Renovação:</strong> assinaturas recorrentes renovam-se
            automaticamente ao fim de cada ciclo, até que sejam canceladas.
          </li>
          <li>
            <strong>Cancelamento:</strong> você pode cancelar a qualquer momento;
            o cancelamento interrompe as renovações futuras, mantendo o acesso
            até o fim do período já pago, salvo disposição diversa.
          </li>
          <li>
            <strong>Direito de arrependimento:</strong> nos termos do art. 49 do
            Código de Defesa do Consumidor, a contratação a distância pode ser
            cancelada em até 7 (sete) dias corridos, com devolução dos valores
            pagos.
          </li>
        </ul>
        <p>
          Os pagamentos poderão ser processados por prestadores de serviços de
          pagamento terceiros; os dados financeiros são tratados por esses
          provedores conforme as respectivas políticas. Enquanto o checkout não
          estiver ativo, o cadastro em “Quero ser avisado” não gera qualquer
          cobrança.
        </p>
      </>
    ),
  },
  {
    id: "comunicacoes",
    titulo: "Comunicações e marketing",
    conteudo: (
      <p>
        Poderemos enviar comunicações operacionais (por exemplo, verificação de
        e-mail e redefinição de senha), essenciais à prestação do serviço.
        Comunicações de marketing só são enviadas mediante o seu consentimento,
        que pode ser revogado a qualquer momento pelo link de descadastro ou pelo
        e-mail{" "}
        <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
          {EMAIL_CONTATO}
        </a>
        .
      </p>
    ),
  },
  {
    id: "privacidade",
    titulo: "Privacidade e proteção de dados",
    conteudo: (
      <p>
        O tratamento de dados pessoais realizado no site observa a Lei Geral de
        Proteção de Dados (Lei nº 13.709/2018 — LGPD) e está detalhado no{" "}
        <Link href="/privacidade" className={linkClasses}>
          Aviso de Privacidade
        </Link>
        , que descreve quais dados coletamos, com quais finalidades e bases
        legais, com quem compartilhamos e como você pode exercer os seus
        direitos.
      </p>
    ),
  },
  {
    id: "responsabilidade",
    titulo: "Isenções e limitação de responsabilidade",
    conteudo: (
      <>
        <p>
          O site é fornecido “no estado em que se encontra”. Empregamos esforços
          razoáveis para manter as informações corretas e o serviço disponível,
          mas não garantimos ausência de erros, interrupções ou que o conteúdo
          seja adequado a uma finalidade específica.
        </p>
        <p>
          Os conteúdos educacionais têm caráter informativo e não substituem
          orientação profissional individualizada. Na medida máxima permitida
          pela legislação aplicável, a HCE não se responsabiliza por danos
          indiretos, lucros cessantes ou por indisponibilidades decorrentes de
          fatores fora do seu controle razoável, inclusive de serviços de
          terceiros.
        </p>
      </>
    ),
  },
  {
    id: "disponibilidade",
    titulo: "Disponibilidade e alterações do serviço",
    conteudo: (
      <p>
        A HCE pode, a seu critério e a qualquer tempo, modificar, suspender ou
        descontinuar, no todo ou em parte, funcionalidades do site, bem como
        realizar manutenções programadas ou emergenciais. Sempre que possível,
        buscaremos comunicar alterações relevantes com antecedência razoável.
      </p>
    ),
  },
  {
    id: "encerramento",
    titulo: "Suspensão e encerramento de conta",
    conteudo: (
      <p>
        Você pode solicitar o encerramento da sua conta a qualquer momento pelo
        e-mail{" "}
        <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
          {EMAIL_CONTATO}
        </a>
        . A HCE poderá suspender ou encerrar contas que violem estes Termos ou a
        legislação, ou diante de risco à segurança. O encerramento observa as
        regras de retenção e exclusão descritas no Aviso de Privacidade.
      </p>
    ),
  },
  {
    id: "terceiros",
    titulo: "Links e serviços de terceiros",
    conteudo: (
      <p>
        O site pode conter links para sites e serviços de terceiros (por exemplo,
        redes sociais). A HCE não controla nem se responsabiliza pelo conteúdo,
        pelas práticas de privacidade ou pelos termos desses terceiros. O acesso
        se dá por sua conta e risco.
      </p>
    ),
  },
  {
    id: "alteracoes",
    titulo: "Alterações destes Termos",
    conteudo: (
      <p>
        Estes Termos podem ser atualizados para refletir mudanças legais,
        técnicas ou de negócio. A versão vigente é sempre a publicada nesta
        página, com a respectiva data de atualização. Alterações relevantes
        poderão ser comunicadas por meios adicionais. O uso continuado do site
        após a publicação implica concordância com a versão revisada.
      </p>
    ),
  },
  {
    id: "legislacao",
    titulo: "Legislação aplicável e foro",
    conteudo: (
      <p>
        Estes Termos são regidos pelas leis da República Federativa do Brasil.
        Fica eleito o foro da {EMPRESA.foro} para dirimir eventuais controvérsias,
        com renúncia a qualquer outro, por mais privilegiado que seja,
        ressalvado o direito do consumidor de demandar no foro de seu domicílio.
      </p>
    ),
  },
  {
    id: "contato",
    titulo: "Contato",
    conteudo: (
      <p>
        Dúvidas sobre estes Termos? Fale com a gente pelo formulário{" "}
        <Link href="/fale-com-a-hce" className={linkClasses}>
          Fale com a HCE
        </Link>{" "}
        ou pelo e-mail{" "}
        <a href={`mailto:${EMAIL_CONTATO}`} className={linkClasses}>
          {EMAIL_CONTATO}
        </a>
        .
      </p>
    ),
  },
];

export default function TermosDeUsoPage() {
  return (
    <LegalLayout
      eyebrow="Jurídico"
      titulo="Termos de Uso"
      resumo="Estas são as condições gerais para acesso e uso do site e dos serviços da HCE Gastronomia. Leia com atenção — ao utilizar o site, você concorda com elas."
      atualizacao={LEGAL_ATUALIZACAO}
      versao={LEGAL_VERSAO}
      secoes={SECOES}
      rodape={
        <>
          Documento vigente desde {LEGAL_ATUALIZACAO} (versão {LEGAL_VERSAO}).
          Recomendamos guardar uma cópia para os seus registros.
        </>
      }
    />
  );
}
