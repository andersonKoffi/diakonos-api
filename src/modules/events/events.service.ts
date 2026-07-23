import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_PRISMA } from '../../core/prisma/prisma.module';
import type { TenantPrismaClient } from '../../core/prisma/prisma.module';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventResponseDto } from './dto/event-response.dto';
import { ListEventsQueryDto } from './dto/list-events-query.dto';

@Injectable()
export class EventsService {
  constructor(
    @Inject(TENANT_PRISMA) private readonly prisma: TenantPrismaClient,
    private readonly cls: ClsService,
  ) {}

  private static readonly include = {
    department: { select: { name: true } },
  };

  async findAll(query: ListEventsQueryDto): Promise<{
    items: EventResponseDto[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = { deletedAt: null };

    const [rows, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: EventsService.include,
        orderBy: { startsAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items: rows.map((r) => EventsService.toDto(r)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: EventsService.include,
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return EventsService.toDto(event);
  }

  async create(dto: CreateEventDto): Promise<EventResponseDto> {
    const userId = this.cls.get<string>('userId');
    const tenantId = this.cls.get<string>('tenantId');
    const created = await this.prisma.event.create({
      data: {
        tenantId,
        name: dto.name,
        type: dto.type,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        departmentId: dto.departmentId,
        createdBy: userId,
      },
      include: EventsService.include,
    });
    return EventsService.toDto(created);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventResponseDto> {
    await this.requireEvent(id);
    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        departmentId: dto.departmentId,
        updatedBy: this.cls.get<string>('userId'),
      },
      include: EventsService.include,
    });
    return EventsService.toDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.requireEvent(id);
    await this.prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: this.cls.get<string>('userId'),
      },
    });
  }

  private async requireEvent(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, deletedAt: null },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  private static toDto(e: {
    id: string;
    name: string;
    type: string;
    location: string | null;
    startsAt: Date;
    endsAt: Date | null;
    departmentId: string | null;
    createdAt: Date;
    department: { name: string } | null;
  }): EventResponseDto {
    return {
      id: e.id,
      name: e.name,
      type: e.type as EventResponseDto['type'],
      location: e.location,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      department: e.department?.name ?? null,
      departmentId: e.departmentId,
      createdAt: e.createdAt,
    };
  }
}
