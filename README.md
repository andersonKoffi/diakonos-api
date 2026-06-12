# Diakonos API

> Backend de la plateforme de gestion financière ecclésiale du réseau MSA — Sophos Studios

API REST NestJS multi-tenant (shared schema + RLS PostgreSQL) exposant la spec OpenAPI consommée par le frontend [diakonos-web](https://github.com/sophos-studios/diakonos-web).

## Prérequis

- Node 22 LTS
- Docker (PostgreSQL 16 en local)
- npm

## Setup local

```bash
git clone <repo> && cd diakonos-api
npm ci
cp .env.example .env        # compléter les valeurs
docker compose up -d        # PostgreSQL
npx prisma migrate dev
npm run seed
npm run start:dev
```

Swagger UI : http://localhost:3000/api/docs — Spec OpenAPI : http://localhost:3000/api/docs-json

## Scripts

| Script         | Rôle                                  |
| -------------- | ------------------------------------- |
| `start:dev`    | serveur de dev avec watch             |
| `build`        | compilation production                |
| `test`         | tests unitaires                       |
| `test:e2e`     | tests end-to-end                      |
| `lint`         | ESLint avec auto-fix                  |
| `migrate`      | migrations Prisma (dev)               |
| `seed`         | données de base (tenant MSA, devises) |
| `openapi:emit` | exporte la spec OpenAPI               |

## Architecture

NestJS modulaire : `src/core/` (infrastructure transverse : Prisma, tenant CLS, auth, storage, audit), `src/common/` (DTOs et utilitaires partagés), `src/modules/` (bounded contexts métier : expenses, incomes, events, funds, departments, reports).

Multi-tenant : `tenant_id` sur les tables métier, injection automatique via extension Prisma `$allOperations` + AsyncLocalStorage (`nestjs-cls`), RLS PostgreSQL en ceinture de sécurité.

Voir `docs/architecture.md` (à venir).

## Conventions

- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope): description`), vérifiés par commitlint
- **Branches** : Gitflow — `main` (production), `develop` (intégration, défaut), `feature/*`, `release/*`, `hotfix/*`
- **Code style** : ESLint + Prettier, appliqués en pre-commit via Husky + lint-staged

## Liens

- Frontend : [diakonos-web](https://github.com/sophos-studios/diakonos-web) (Angular 21)
