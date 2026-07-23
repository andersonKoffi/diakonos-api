import { Module } from '@nestjs/common';
import { FundsController } from './funds.controller';
import { FundsService } from './funds.service';

@Module({
  controllers: [FundsController],
  providers: [FundsService],
})
export class FundsModule {}
