-- HCE — RLS (Row Level Security) previsto
-- A trava mora no Postgres (Neon). A UI e o Prisma NÃO são a última linha.
-- Hoje (ago/2026): NÃO há RLS. O app usa um PrismaClient com a connection
-- string dona das tabelas — quem furar a rota Next lê qualquer linha.
-- Este arquivo é o contrato a aplicar antes de tratar dado de membro como
-- confidencial (endereço, telefone, e-mail, leads).
--
-- Papéis de conexão:
--   hce_owner  → migrations / db push (BYPASSRLS implícito de dono de tabela)
--   hce_app    → Next.js (DATABASE_URL de runtime). SEM BYPASS. FORCE RLS.
--
-- Sessão por request (transaction):
--   SET LOCAL app.actor_kind = 'anon' | 'member' | 'admin';
--   SET LOCAL app.actor_id   = '<cuid>';  -- User.id ou Admin.id
--   SET LOCAL app.plano      = 'free' | 'essencial' | 'profissional' | 'premium';
--
-- Prisma: abrir transação, SET LOCAL, depois queries. Sem isso o RLS
-- trata o pedido como anon e recusa linha de membro.

-- ALTER ROLE hce_app NOBYPASSRLS;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hce_app;

-- ── User (cadastro do site) ──────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_self_select ON "User";
CREATE POLICY user_self_select ON "User"
  FOR SELECT
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND id = current_setting('app.actor_id', true)
    )
  );

DROP POLICY IF EXISTS user_self_update ON "User";
CREATE POLICY user_self_update ON "User"
  FOR UPDATE
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND id = current_setting('app.actor_id', true)
    )
  )
  WITH CHECK (
    current_setting('app.actor_kind', true) = 'admin'
    OR id = current_setting('app.actor_id', true)
  );

DROP POLICY IF EXISTS user_insert_register ON "User";
CREATE POLICY user_insert_register ON "User"
  FOR INSERT
  WITH CHECK (
    current_setting('app.actor_kind', true) IN ('anon', 'admin')
  );

DROP POLICY IF EXISTS user_admin_delete ON "User";
CREATE POLICY user_admin_delete ON "User"
  FOR DELETE
  USING (current_setting('app.actor_kind', true) = 'admin');

-- ── Account / Session (Auth.js) ──────────────────────────────────────
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" FORCE ROW LEVEL SECURITY;
CREATE POLICY account_own ON "Account"
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND "userId" = current_setting('app.actor_id', true)
    )
  );

ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" FORCE ROW LEVEL SECURITY;
CREATE POLICY session_own ON "Session"
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND "userId" = current_setting('app.actor_id', true)
    )
  );

-- VerificationToken: só o fluxo de auth (anon/admin). Sem SELECT de membro.
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" FORCE ROW LEVEL SECURITY;
CREATE POLICY vt_auth ON "VerificationToken"
  USING (current_setting('app.actor_kind', true) IN ('anon', 'admin'));

-- ── Artigo (Feed) ────────────────────────────────────────────────────
ALTER TABLE "Artigo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Artigo" FORCE ROW LEVEL SECURITY;
CREATE POLICY artigo_public_read ON "Artigo"
  FOR SELECT
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR publicado = true
  );
CREATE POLICY artigo_admin_write ON "Artigo"
  FOR ALL
  USING (current_setting('app.actor_kind', true) = 'admin')
  WITH CHECK (current_setting('app.actor_kind', true) = 'admin');

-- ── Comentario ───────────────────────────────────────────────────────
ALTER TABLE "Comentario" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Comentario" FORCE ROW LEVEL SECURITY;
CREATE POLICY comentario_read ON "Comentario"
  FOR SELECT
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR status = 'aprovado'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND "userId" = current_setting('app.actor_id', true)
    )
  );
CREATE POLICY comentario_insert_own ON "Comentario"
  FOR INSERT
  WITH CHECK (
    current_setting('app.actor_kind', true) = 'admin'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND "userId" = current_setting('app.actor_id', true)
      AND status = 'pendente'
    )
  );
CREATE POLICY comentario_admin_mod ON "Comentario"
  FOR UPDATE
  USING (current_setting('app.actor_kind', true) = 'admin');

-- ── Reações e acessos do Feed ────────────────────────────────────────
ALTER TABLE "ArtigoReacao" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ArtigoReacao" FORCE ROW LEVEL SECURITY;
CREATE POLICY reacao_own ON "ArtigoReacao"
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR "userId" = current_setting('app.actor_id', true)
  );

ALTER TABLE "FeedAcesso" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "FeedAcesso" FORCE ROW LEVEL SECURITY;
CREATE POLICY feedacesso_own ON "FeedAcesso"
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR "userId" = current_setting('app.actor_id', true)
  );

-- ── Leads / contato / pageview / backlog / admin* — só admin ─────────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ClubeLead', 'ContatoMensagem', 'PageView', 'BacklogItem',
    'Admin', 'AdminSession', 'AdminResetToken', 'AdminLog'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I_admin_only ON %I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_admin_only ON %I
         USING (current_setting(''app.actor_kind'', true) = ''admin'')
         WITH CHECK (current_setting(''app.actor_kind'', true) = ''admin'')',
      t, t);
  END LOOP;
END $$;

-- Anônimo PODE inserir lead e contato (formulários públicos)
DROP POLICY IF EXISTS clubelead_anon_insert ON "ClubeLead";
CREATE POLICY clubelead_anon_insert ON "ClubeLead"
  FOR INSERT
  WITH CHECK (current_setting('app.actor_kind', true) IN ('anon', 'admin'));

DROP POLICY IF EXISTS contato_anon_insert ON "ContatoMensagem";
CREATE POLICY contato_anon_insert ON "ContatoMensagem"
  FOR INSERT
  WITH CHECK (current_setting('app.actor_kind', true) IN ('anon', 'admin'));

DROP POLICY IF EXISTS pageview_anon_insert ON "PageView";
CREATE POLICY pageview_anon_insert ON "PageView"
  FOR INSERT
  WITH CHECK (current_setting('app.actor_kind', true) IN ('anon', 'member', 'admin'));

-- ── MediaAsset ───────────────────────────────────────────────────────
ALTER TABLE "MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MediaAsset" FORCE ROW LEVEL SECURITY;
CREATE POLICY media_read ON "MediaAsset"
  FOR SELECT
  USING (
    current_setting('app.actor_kind', true) = 'admin'
    OR visibilidade = 'publico'
    OR (
      current_setting('app.actor_kind', true) = 'member'
      AND visibilidade = 'privado'
      AND (
        ("planoMinimo" = 'free')
        OR ("planoMinimo" = 'essencial' AND current_setting('app.plano', true) IN ('essencial','profissional','premium'))
        OR ("planoMinimo" = 'profissional' AND current_setting('app.plano', true) IN ('profissional','premium'))
        OR ("planoMinimo" = 'premium' AND current_setting('app.plano', true) = 'premium')
      )
    )
  );
CREATE POLICY media_admin_write ON "MediaAsset"
  FOR ALL
  USING (current_setting('app.actor_kind', true) = 'admin')
  WITH CHECK (current_setting('app.actor_kind', true) = 'admin');

-- ── Imagem (bytes no Postgres) ───────────────────────────────────────
ALTER TABLE "Imagem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Imagem" FORCE ROW LEVEL SECURITY;
-- Capa de artigo publicado precisa ser lida por membro; rascunho só admin.
-- Sem FK artigoId na tabela Imagem: SELECT permitido a member/anon só via
-- URL já autorizada na app NÃO basta — por isso o previsto é: member lê;
-- admin lê/grava; anon não lista o catálogo (SELECT bloqueado a anon).
CREATE POLICY imagem_member_select ON "Imagem"
  FOR SELECT
  USING (current_setting('app.actor_kind', true) IN ('member', 'admin'));
CREATE POLICY imagem_admin_write ON "Imagem"
  FOR ALL
  USING (current_setting('app.actor_kind', true) = 'admin')
  WITH CHECK (current_setting('app.actor_kind', true) = 'admin');
