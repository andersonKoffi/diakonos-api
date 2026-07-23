import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { ExpenseStatus } from '../../generated/prisma/enums';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { FundResponseDto } from './dto/fund-response.dto';

type FundRow = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  goal: unknown;
  prudentialFloor: unknown;
  boardDecisionRef: string | null;
  closed: boolean;
  createdAt: Date;
};

@Injectable()
export class FundsService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly cls: ClsService,
  ) {}

  async findAll(): Promise<FundResponseDto[]> {
    const funds = await this.prisma.fund.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    const balances = await this.balancesFor(funds.map((f) => f.id));
    return funds.map((f) => FundsService.toDto(f, balances.get(f.id) ?? 0));
  }

  async findOne(id: string): Promise<FundResponseDto> {
    const fund = await this.requireFund(id);
    const balances = await this.balancesFor([id]);
    return FundsService.toDto(fund, balances.get(id) ?? 0);
  }

  async create(dto: CreateFundDto): Promise<FundResponseDto> {
    const userId = this.cls.get<string>('userId');
    const tenantId = this.cls.get<string>('tenantId');
    const created = await this.prisma.fund.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        isActive: dto.isActive ?? true,
        goal: dto.goal,
        prudentialFloor: dto.prudentialFloor,
        boardDecisionRef: dto.boardDecisionRef,
        closed: dto.closed ?? false,
        createdBy: userId,
      },
    });
    return FundsService.toDto(created, 0);
  }

  async update(id: string, dto: UpdateFundDto): Promise<FundResponseDto> {
    await this.requireFund(id);
    const updated = await this.prisma.fund.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        description: dto.description,
        isActive: dto.isActive ?? true,
        goal: dto.goal,
        prudentialFloor: dto.prudentialFloor,
        boardDecisionRef: dto.boardDecisionRef,
        closed: dto.closed ?? false,
        updatedBy: this.cls.get<string>('userId'),
      },
    });
    const balances = await this.balancesFor([id]);
    return FundsService.toDto(updated, balances.get(id) ?? 0);
  }

  async remove(id: string): Promise<void> {
    await this.requireFund(id);
    await this.prisma.fund.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: this.cls.get<string>('userId'),
      },
    });
  }

  private async requireFund(id: string) {
    const fund = await this.prisma.fund.findFirst({
      where: { id, deletedAt: null },
    });
    if (!fund) throw new NotFoundException('Fonds introuvable');
    return fund;
  }

  /** Solde = somme des offrandes/dons reçus - somme des frais remboursés (PAID), par fonds. */
  private async balancesFor(fundIds: string[]): Promise<Map<string, number>> {
    if (fundIds.length === 0) return new Map();

    const [incomeSums, expenseSums] = await Promise.all([
      this.prisma.income.groupBy({
        by: ['fundId'],
        where: { fundId: { in: fundIds }, deletedAt: null },
        _sum: { amount: true },
      }),
      this.prisma.expense.groupBy({
        by: ['fundId'],
        where: {
          fundId: { in: fundIds },
          status: ExpenseStatus.PAID,
          deletedAt: null,
        },
        _sum: { amount: true },
      }),
    ]);

    const balances = new Map<string, number>();
    for (const id of fundIds) balances.set(id, 0);
    for (const row of incomeSums) {
      if (!row.fundId) continue;
      balances.set(
        row.fundId,
        (balances.get(row.fundId) ?? 0) + Number(row._sum.amount ?? 0),
      );
    }
    for (const row of expenseSums) {
      if (!row.fundId) continue;
      balances.set(
        row.fundId,
        (balances.get(row.fundId) ?? 0) - Number(row._sum.amount ?? 0),
      );
    }
    return balances;
  }

  private static toDto(f: FundRow, balance: number): FundResponseDto {
    return {
      id: f.id,
      name: f.name,
      type: f.type as FundResponseDto['type'],
      description: f.description,
      isActive: f.isActive,
      balance,
      goal: f.goal !== null && f.goal !== undefined ? Number(f.goal) : null,
      prudentialFloor:
        f.prudentialFloor !== null && f.prudentialFloor !== undefined
          ? Number(f.prudentialFloor)
          : null,
      boardDecisionRef: f.boardDecisionRef,
      closed: f.closed,
      createdAt: f.createdAt,
    };
  }
}
