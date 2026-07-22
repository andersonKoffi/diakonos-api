import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/auth/jwt-auth.guard';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';

/**
 * Référentiels alimentant les listes déroulantes du frontend.
 * Lecture seule ; le CRUD complet arrivera avec les modules dédiés.
 */
@ApiTags('Référentiels')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ReferenceController {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
  ) {}

  @Get('expense-categories')
  @ApiOperation({ summary: 'Catégories de dépense de mon église' })
  categories() {
    return this.prisma.expenseCategory.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('departments')
  @ApiOperation({ summary: 'Départements de mon église' })
  departments() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('funds')
  @ApiOperation({ summary: 'Fonds de mon église' })
  funds() {
    return this.prisma.fund.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Devises disponibles (référentiel global)' })
  currencies() {
    return this.prisma.currency.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        symbol: true,
        decimals: true,
      },
      orderBy: { code: 'asc' },
    });
  }
}
