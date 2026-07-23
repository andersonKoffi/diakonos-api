import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly cls: ClsService,
  ) {}

  async findAll(): Promise<DepartmentResponseDto[]> {
    const rows = await this.prisma.department.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => DepartmentsService.toDto(r));
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    return DepartmentsService.toDto(await this.requireDepartment(id));
  }

  async create(dto: CreateDepartmentDto): Promise<DepartmentResponseDto> {
    const userId = this.cls.get<string>('userId');
    const tenantId = this.cls.get<string>('tenantId');
    const created = await this.prisma.department.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        createdBy: userId,
      },
    });
    return DepartmentsService.toDto(created);
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    await this.requireDepartment(id);
    const updated = await this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        updatedBy: this.cls.get<string>('userId'),
      },
    });
    return DepartmentsService.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.requireDepartment(id);
    await this.prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: this.cls.get<string>('userId'),
      },
    });
  }

  private async requireDepartment(id: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, deletedAt: null },
    });
    if (!department) throw new NotFoundException('Département introuvable');
    return department;
  }

  private static toDto(d: {
    id: string;
    name: string;
    code: string | null;
    createdAt: Date;
  }): DepartmentResponseDto {
    return { id: d.id, name: d.name, code: d.code, createdAt: d.createdAt };
  }
}
