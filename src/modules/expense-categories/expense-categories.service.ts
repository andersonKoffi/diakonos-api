import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoryResponseDto } from './dto/expense-category-response.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly cls: ClsService,
  ) {}

  async findAll(): Promise<ExpenseCategoryResponseDto[]> {
    const rows = await this.prisma.expenseCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return rows.map((c) => ExpenseCategoriesService.toDto(c));
  }

  async findOne(id: string): Promise<ExpenseCategoryResponseDto> {
    return ExpenseCategoriesService.toDto(await this.requireCategory(id));
  }

  async create(
    dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategoryResponseDto> {
    const userId = this.cls.get<string>('userId');
    const tenantId = this.cls.get<string>('tenantId');
    const created = await this.prisma.expenseCategory.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        createdBy: userId,
      },
    });
    return ExpenseCategoriesService.toDto(created);
  }

  async update(
    id: string,
    dto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategoryResponseDto> {
    await this.requireCategory(id);
    const updated = await this.prisma.expenseCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isActive: dto.isActive ?? true,
        updatedBy: this.cls.get<string>('userId'),
      },
    });
    return ExpenseCategoriesService.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.requireCategory(id);
    await this.prisma.expenseCategory.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: this.cls.get<string>('userId'),
      },
    });
  }

  private async requireCategory(id: string) {
    const category = await this.prisma.expenseCategory.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) throw new NotFoundException('Catégorie introuvable');
    return category;
  }

  private static toDto(c: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
  }): ExpenseCategoryResponseDto {
    return {
      id: c.id,
      name: c.name,
      description: c.description,
      isActive: c.isActive,
      createdAt: c.createdAt,
    };
  }
}
