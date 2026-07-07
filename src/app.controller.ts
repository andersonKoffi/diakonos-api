import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import * as prismaModule from './core/prisma/prisma.module';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(prismaModule.TENANT_PRISMA)
    private readonly prisma: prismaModule.TenantPrismaClient,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('debug/departments')
  listDepartments() {
    return this.prisma.department.findMany({ select: { name: true } }); // ✅
  }
}
