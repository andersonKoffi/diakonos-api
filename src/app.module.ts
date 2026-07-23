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
import { DepartmentsModule } from './modules/departments/departments.module';
import { ExpenseCategoriesModule } from './modules/expense-categories/expense-categories.module';
import { CurrenciesModule } from './modules/currencies/currencies.module';
import { FundsModule } from './modules/funds/funds.module';
import { EventsModule } from './modules/events/events.module';

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
    DepartmentsModule,
    ExpenseCategoriesModule,
    CurrenciesModule,
    FundsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
