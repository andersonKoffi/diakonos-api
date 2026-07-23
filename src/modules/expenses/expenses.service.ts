import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { ExpenseStatus } from '../../generated/prisma/enums';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseResponseDto } from './dto/expense-response.dto';
import { ListExpensesQueryDto } from './dto/list-expenses-query.dto';

/** Seuil au-delà duquel le validateur doit être différent du demandeur. */
const SELF_APPROVAL_LIMIT = 100_000;

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
    fund: { select: { name: true, type: true } },
    event: { select: { name: true } },
    requester: { select: { firstName: true, lastName: true } },
    approvedBy: { select: { firstName: true, lastName: true } },
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
      items: rows.map((r) => ExpensesService.toDto(r)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<ExpenseResponseDto> {
    const expense = await this.prisma.expense.findFirst({
      where: { id, deletedAt: null },
      include: ExpensesService.include,
    });
    if (!expense) throw new NotFoundException('Frais introuvable');
    return ExpensesService.toDto(expense);
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
        paymentMethod: dto.paymentMethod,
        expenseDate: new Date(dto.expenseDate),
        departmentId: dto.departmentId,
        fundId: dto.fundId,
        eventId: dto.eventId,
        requesterId: userId,
        createdBy: userId,
      },
      include: ExpensesService.include,
    });

    return ExpensesService.toDto(created);
  }

  /** Édition d'un frais — réservée au statut DRAFT (au-delà, la donnée est engagée). */
  async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseResponseDto> {
    const expense = await this.requireExpense(id);
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un frais en brouillon peut être modifié',
      );
    }
    return this.transition(id, {
      label: dto.label,
      description: dto.description,
      amount: dto.amount,
      currencyId: dto.currencyId,
      categoryId: dto.categoryId,
      expenseDate: new Date(dto.expenseDate),
      paymentMethod: dto.paymentMethod,
      departmentId: dto.departmentId,
      fundId: dto.fundId,
      eventId: dto.eventId,
    });
  }

  /** Suppression (douce) d'un frais — réservée au statut DRAFT. */
  async remove(id: string): Promise<void> {
    const expense = await this.requireExpense(id);
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un frais en brouillon peut être supprimé',
      );
    }
    await this.prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: this.cls.get<string>('userId'),
      },
    });
  }

  /** DRAFT -> SUBMITTED : le demandeur envoie son frais en validation. */
  async submit(id: string): Promise<ExpenseResponseDto> {
    const expense = await this.requireExpense(id);
    if (expense.status !== ExpenseStatus.DRAFT) {
      throw new BadRequestException(
        'Seul un frais en brouillon peut être soumis',
      );
    }
    return this.transition(id, {
      status: ExpenseStatus.SUBMITTED,
      submittedAt: new Date(),
    });
  }

  /** SUBMITTED -> APPROVED, sous contrôle de la règle de séparation des rôles. */
  async approve(id: string): Promise<ExpenseResponseDto> {
    const userId = this.cls.get<string>('userId');
    const expense = await this.requireExpense(id);

    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new BadRequestException('Seul un frais soumis peut être validé');
    }

    // Contrôle interne : au-delà du seuil, personne ne valide sa propre dépense.
    if (
      Number(expense.amount) > SELF_APPROVAL_LIMIT &&
      expense.requesterId === userId
    ) {
      throw new ForbiddenException(
        `Au-delà de ${SELF_APPROVAL_LIMIT} XOF, la validation doit être faite par une autre personne que le demandeur`,
      );
    }

    return this.transition(id, {
      status: ExpenseStatus.APPROVED,
      approvedAt: new Date(),
      approvedById: userId,
      rejectionReason: null,
    });
  }

  /** SUBMITTED -> REJECTED, motif obligatoire. */
  async reject(id: string, reason: string): Promise<ExpenseResponseDto> {
    const expense = await this.requireExpense(id);
    if (expense.status !== ExpenseStatus.SUBMITTED) {
      throw new BadRequestException('Seul un frais soumis peut être rejeté');
    }
    return this.transition(id, {
      status: ExpenseStatus.REJECTED,
      rejectionReason: reason,
    });
  }

  /** APPROVED -> PAID : le remboursement a été effectué. */
  async markPaid(id: string): Promise<ExpenseResponseDto> {
    const expense = await this.requireExpense(id);
    if (expense.status !== ExpenseStatus.APPROVED) {
      throw new BadRequestException(
        'Seul un frais validé peut être marqué remboursé',
      );
    }
    return this.transition(id, {
      status: ExpenseStatus.PAID,
      paidAt: new Date(),
    });
  }

  private async requireExpense(id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, deletedAt: null },
    });
    if (!expense) throw new NotFoundException('Frais introuvable');
    return expense;
  }

  private async transition(
    id: string,
    data: Record<string, unknown>,
  ): Promise<ExpenseResponseDto> {
    const updated = await this.prisma.expense.update({
      where: { id },
      data: { ...data, updatedBy: this.cls.get<string>('userId') },
      include: ExpensesService.include,
    });
    return ExpensesService.toDto(updated);
  }

  /** Référence lisible du type FR-2026-0007, remise à zéro chaque année. */
  private async nextReference(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.expense.count();
    return `FR-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private static toDto(e: {
    id: string;
    reference: string;
    label: string;
    description: string | null;
    amount: unknown;
    currencyId: string;
    categoryId: string;
    paymentMethod: string | null;
    status: string;
    expenseDate: Date;
    departmentId: string | null;
    fundId: string | null;
    eventId: string | null;
    requesterId: string;
    submittedAt: Date | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    currency: { code: string };
    category: { name: string };
    department: { name: string } | null;
    fund: { name: string; type: string } | null;
    event: { name: string } | null;
    requester: { firstName: string; lastName: string };
    approvedBy: { firstName: string; lastName: string } | null;
  }): ExpenseResponseDto {
    return {
      id: e.id,
      reference: e.reference,
      label: e.label,
      description: e.description,
      amount: Number(e.amount),
      currency: e.currency.code,
      currencyId: e.currencyId,
      category: e.category.name,
      categoryId: e.categoryId,
      paymentMethod: e.paymentMethod,
      status: e.status,
      expenseDate: e.expenseDate.toISOString().slice(0, 10),
      department: e.department?.name ?? null,
      departmentId: e.departmentId,
      fund: e.fund?.name ?? null,
      fundId: e.fundId,
      fundType: e.fund?.type ?? null,
      event: e.event?.name ?? null,
      eventId: e.eventId,
      requester: `${e.requester.firstName} ${e.requester.lastName}`,
      requesterId: e.requesterId,
      submittedAt: e.submittedAt,
      approvedBy: e.approvedBy
        ? `${e.approvedBy.firstName} ${e.approvedBy.lastName}`
        : null,
      approvedAt: e.approvedAt,
      rejectionReason: e.rejectionReason,
      createdAt: e.createdAt,
    };
  }
}
