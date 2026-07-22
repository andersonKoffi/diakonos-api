import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './core/prisma/prisma.module';
import { ClsModule } from 'nestjs-cls';
import { TenantModule } from './core/tenant/tenant.module';
import { AuthModule } from './core/auth/auth.module';
import { HealthModule } from './core/health/health.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { ReferenceModule } from './modules/reference/reference.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    TenantModule,
    PrismaModule,
    AuthModule,
    HealthModule,
    ExpensesModule,
    ReferenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
