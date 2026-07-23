import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import {
  PrismaClient,
  TenantRole,
  FundType,
} from '../src/generated/prisma/client';

// Client en mode PROPRIÉTAIRE (DATABASE_URL) → bypasse le RLS, voulu pour le seed.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- 1. Devises (globales, pas de tenant_id) ---
  const currencies = [
    { code: 'XOF', name: 'Franc CFA (BCEAO)', symbol: 'FCFA', decimals: 0 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
    { code: 'USD', name: 'Dollar américain', symbol: '$', decimals: 2 },
  ];
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // --- 2. Tenant MSA Abidjan ---
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'msa-abidjan' },
    update: {},
    create: {
      name: 'MSA Abidjan',
      slug: 'msa-abidjan',
      city: 'Abidjan',
      country: 'CI',
    },
  });

  // --- 3. Utilisateurs de test ---
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const accountant = await prisma.user.upsert({
    where: { email: 'comptable@msa.ci' },
    update: {},
    create: {
      email: 'comptable@msa.ci',
      passwordHash,
      firstName: 'Awa',
      lastName: 'Comptable',
    },
  });

  const treasurer = await prisma.user.upsert({
    where: { email: 'tresorier@msa.ci' },
    update: {},
    create: {
      email: 'tresorier@msa.ci',
      passwordHash,
      firstName: 'Koffi',
      lastName: 'Tresorier',
    },
  });

  // --- 4. Rôles dans le tenant ---
  const roles: { userId: string; role: TenantRole }[] = [
    { userId: accountant.id, role: TenantRole.ACCOUNTANT },
    { userId: treasurer.id, role: TenantRole.TREASURER },
  ];
  for (const r of roles) {
    await prisma.userTenantRole.upsert({
      where: {
        userId_tenantId_role: {
          userId: r.userId,
          tenantId: tenant.id,
          role: r.role,
        },
      },
      update: {},
      create: { userId: r.userId, tenantId: tenant.id, role: r.role },
    });
  }

  // --- 5. Catégories de dépense par défaut ---
  const categories = [
    'Transport',
    'Restauration',
    'Fournitures',
    'Communication',
    'Maintenance',
    'Loyer',
  ];
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
  }

  // --- 6. Départements ---
  const departments = ['Chorale', 'Accueil', 'Jeunesse', 'Intercession'];
  for (const name of departments) {
    await prisma.department.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    });
  }

  // --- 7. Fonds ---
  const funds: { name: string; type: FundType }[] = [
    { name: 'Fonds general', type: FundType.UNRESTRICTED },
    { name: 'Construction du temple', type: FundType.RESTRICTED },
    { name: 'Actions sociales', type: FundType.RESTRICTED },
  ];
  for (const f of funds) {
    await prisma.fund.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: f.name } },
      update: {},
      create: { tenantId: tenant.id, name: f.name, type: f.type },
    });
  }

  console.log(`Tenant : ${tenant.name} (${tenant.id})`);
  console.log(`Users  : ${accountant.email}, ${treasurer.email}`);
  console.log(`Mot de passe de test : Password123!`);
}

main()
  .then(() => console.log('✅ Seed termine'))
  .catch((e) => {
    console.error('❌ Seed echoue :', e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
