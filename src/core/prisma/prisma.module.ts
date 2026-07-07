import { Global, Module } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from './prisma.service';
import { tenantExtension } from './tenant.extension';

export const TENANT_PRISMA = 'TENANT_PRISMA';

// Fabrique le client étendu. On dérive le type de CETTE fonction (voir plus bas),
// ce qui force TypeScript à instancier correctement les génériques de $extends.
const createTenantPrisma = (base: PrismaService, cls: ClsService) =>
  base.$extends(tenantExtension(cls));

export type TenantPrismaClient = ReturnType<typeof createTenantPrisma>;

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TENANT_PRISMA,
      inject: [PrismaService, ClsService],
      useFactory: createTenantPrisma,
    },
  ],
  exports: [PrismaService, TENANT_PRISMA],
})
export class PrismaModule {}
