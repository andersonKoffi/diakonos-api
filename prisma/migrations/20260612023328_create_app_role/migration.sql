-- ============================================================================
-- Rôle applicatif `diakonos_app` : l'utilisateur que l'API NestJS utilisera.
--
-- Pourquoi : l'utilisateur `diakonos` (créé par l'image Docker) est SUPERUSER,
-- et un superuser ignore TOUTES les policies RLS. On sépare donc :
--   * diakonos      → migrations + seed (doit tout voir, bypasse le RLS) ;
--   * diakonos_app  → API en production (subit le RLS, sans échappatoire).
--
-- Le mot de passe ci-dessous est celui du DEV LOCAL uniquement. Sur le VPS :
--   ALTER ROLE diakonos_app PASSWORD '<mot de passe fort>';
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'diakonos_app') THEN
    CREATE ROLE diakonos_app LOGIN PASSWORD 'diakonos_app';
  END IF;
END $$;

-- Droit d'accéder au schéma et de manipuler les données (pas la structure)
GRANT USAGE ON SCHEMA public TO diakonos_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO diakonos_app;

-- Les tables créées par les FUTURES migrations seront accessibles aussi
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO diakonos_app;

-- La table interne de Prisma ne regarde pas l'application
-- (conditionnel : elle n'existe pas sur la base miroir utilisée par Prisma)
DO $$
BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM diakonos_app;
  END IF;
END $$;
