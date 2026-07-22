import { Module } from '@nestjs/common';
import { ReferenceController } from './reference.controller';

@Module({
  controllers: [ReferenceController],
})
export class ReferenceModule {}
