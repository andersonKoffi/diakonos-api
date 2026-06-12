-- ============================================================================
-- Row-Level Security (RLS) : isolation des données par église (tenant)
--
-- Principe : chaque requête applicative positionne la variable de session
-- `app.current_tenant_id`. PostgreSQL ne montre alors QUE les lignes dont
-- `tenant_id` correspond — même si le code applicatif oublie un filtre.
--
-- - ENABLE ROW LEVEL SECURITY : active le mécanisme sur la table.
-- - FORCE ROW LEVEL SECURITY  : l'applique AUSSI au propriétaire de la table
--   (l'utilisateur `diakonos` que Prisma utilise). Sans FORCE, le propriétaire
--   bypasse silencieusement les policies et le RLS ne protège rien.
-- - NULLIF(current_setting(...), '') : si la variable n'est pas définie
--   (ou vide), le résultat est NULL → aucune ligne ne matche → zéro fuite.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Tables strictement tenant-scoped : une ligne appartient à UNE église
-- ---------------------------------------------------------------------------

ALTER TABLE user_tenant_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tenant_roles FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON user_tenant_roles
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON departments
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE events FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON events
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE funds FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON funds
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON expense_categories
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON expenses
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE expense_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_attachments FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON expense_attachments
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON incomes
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE counting_pvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE counting_pvs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON counting_pvs
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

ALTER TABLE counting_pv_signatories ENABLE ROW LEVEL SECURITY;
ALTER TABLE counting_pv_signatories FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON counting_pv_signatories
  USING (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- ---------------------------------------------------------------------------
-- audit_logs : cas particulier — tenant_id peut être NULL (action système).
-- IS NOT DISTINCT FROM = comme `=` mais traite NULL = NULL comme vrai :
--   * contexte église posé  → on ne voit que les logs de cette église ;
--   * aucun contexte (jobs système) → on ne voit que les logs système (NULL).
-- ---------------------------------------------------------------------------

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON audit_logs
  USING (tenant_id IS NOT DISTINCT FROM NULLIF(current_setting('app.current_tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id IS NOT DISTINCT FROM NULLIF(current_setting('app.current_tenant_id', true), '')::uuid);

-- Tables volontairement SANS RLS :
--   tenants, users, refresh_tokens  → pas de tenant_id (résolution du tenant
--     et authentification se font AVANT que le contexte église n'existe) ;
--   currencies, exchange_rates      → référentiels partagés par tout le monde.
