import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { EventType } from '../../../generated/prisma/enums';

export class CreateEventDto {
  @ApiProperty({ example: 'Culte de dimanche' })
  @IsString()
  @MaxLength(160)
  name: string;

  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiPropertyOptional({ example: 'Temple central' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  location?: string;

  @ApiProperty({ example: '2026-07-26T09:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiPropertyOptional({ example: '2026-07-26T12:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ description: 'Département organisateur' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
