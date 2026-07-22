import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';

type ExpenseWithRelations = {
  id: string;
  reference: string;
  label: string;
  description: string | null;
  amount: { toString(): string };
  status: string;
  expenseDate: Date;
  createdAt: Date;
  currency: { code: string };
  category: { name: string };
  department: { name: string } | null;
  fund: { name: string } | null;
  requester: { firstName: string; lastName: string };
};

@Injectable()
export class ExpensesService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly cls: ClsService,
  ) {}

  private static readonly include = {
    currency: { select: { code: true } },
    category: { select: { name: true } },
    department: { select: { name: true } },
    fund: { select: { name: true } },
    requester: { select: { firstName: true, lastName: true } },
  };

  async findAll(query: ListExpensesQueryDto): Promise<{
    items: ExpenseResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        include: ExpensesService.include,
        orderBy: { expenseDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      items: (rows as unknown as ExpenseWithRelations[]).map((r) =>
        ExpensesService.toDto(r),
      ),
      total,
      page,
      pageSize,
    };
  }

  async create(dto: CreateExpenseDto): Promise<ExpenseResponseDto> {
    const userId = this.cls.get<string>('userId');
    const tenantId = this.cls.get<string>('tenantId');

    const created = await this.prisma.expense.create({
      data: {
        tenantId,
        reference: await this.nextReference(),
        label: dto.label,
        description: dto.description,
        amount: dto.amount,
        currencyId: dto.currencyId,
        categoryId: dto.categoryId,
        expenseDate: new Date(dto.expenseDate),
        departmentId: dto.departmentId,
        fundId: dto.fundId,
        requesterId: userId,
        createdBy: userId,
      },
      include: ExpensesService.include,
    });

    return ExpensesService.toDto(created);
  }

  /** Référence lisible du type FR-2026-0007, remise à zéro chaque année. */
  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.expense.count();
    return `FR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private static toDto(e: ExpenseWithRelations): ExpenseResponseDto {
    return {
      id: e.id,
      reference: e.reference,
      label: e.label,
      description: e.description,
      amount: Number(e.amount.toString()),
      currency: e.currency.code,
      category: e.category.name,
      status: e.status,
      expenseDate: e.expenseDate.toISOString().slice(0, 10),
      department: e.department?.name ?? null,
      fund: e.fund?.name ?? null,
      requester: `${e.requester.firstName} ${e.requester.lastName}`,
      createdAt: e.createdAt,
    };
  }
}
