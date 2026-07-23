import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { CurrencyResponseDto } from './dto/currency-response.dto';

/**
 * Référentiel global (pas de tenantId, pas de deletedAt — partagé par toutes
 * les églises, cf. migration RLS qui exclut volontairement `currencies`).
 * Pas de suppression : une devise se désactive via `isActive: false`.
 */
@Injectable()
export class CurrenciesService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
  ) {}

  async findAll(): Promise<CurrencyResponseDto[]> {
    const rows = await this.prisma.currency.findMany({
      orderBy: { code: 'asc' },
    });
    return rows.map((r) => CurrenciesService.toDto(r));
  }

  async findOne(id: string): Promise<CurrencyResponseDto> {
    return CurrenciesService.toDto(await this.requireCurrency(id));
  }

  async create(dto: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    const created = await this.prisma.currency.create({
      data: {
        code: dto.code,
        name: dto.name,
        symbol: dto.symbol,
        decimals: dto.decimals ?? 2,
        isActive: dto.isActive ?? true,
      },
    });
    return CurrenciesService.toDto(created);
  }

  async update(
    id: string,
    dto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    await this.requireCurrency(id);
    const updated = await this.prisma.currency.update({
      where: { id },
      data: {
        code: dto.code,
        name: dto.name,
        symbol: dto.symbol,
        decimals: dto.decimals ?? 2,
        isActive: dto.isActive ?? true,
      },
    });
    return CurrenciesService.toDto(updated);
  }

  private async requireCurrency(id: string) {
    const currency = await this.prisma.currency.findFirst({ where: { id } });
    if (!currency) throw new NotFoundException('Devise introuvable');
    return currency;
  }

  private static toDto(c: {
    id: string;
    code: string;
    name: string;
    symbol: string | null;
    decimals: number;
    isActive: boolean;
  }): CurrencyResponseDto {
    return {
      id: c.id,
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      decimals: c.decimals,
      isActive: c.isActive,
    };
  }
}
