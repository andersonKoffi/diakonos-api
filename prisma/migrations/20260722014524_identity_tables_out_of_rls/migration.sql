-- ============================================================================
-- user_tenant_roles rejoint le domaine IDENTITÉ (comme users et refresh_tokens)
-- et sort donc du périmètre RLS.
--
-- Pourquoi : l'authentification doit lire les adhésions d'un utilisateur AVANT
-- de savoir à quelle église il appartient — c'est précisément ce que cette
-- lecture détermine. Avec le RLS actif et aucun contexte tenant positionné,
-- la requête renvoyait zéro ligne et tout login échouait.
--
-- Contrepartie assumée : l'isolation de cette table n'est plus garantie par la
-- base. Toute requête applicative dessus DOIT filtrer explicitement (par
-- user_id pour l'auth, par tenant_id pour un futur module « membres »).
-- ============================================================================

DROP POLICY IF EXISTS tenant_isolation ON user_tenant_roles;
ALTER TABLE user_tenant_roles NO FORCE ROW LEVEL SECURITY;
ALTER TABLE user_tenant_roles DISABLE ROW LEVEL SECURITY;
