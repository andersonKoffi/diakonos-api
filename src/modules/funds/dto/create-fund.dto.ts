import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { FundType } from '../../../generated/prisma/enums';

export class CreateFundDto {
  @ApiProperty({ example: 'Fonds general' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: FundType })
  @IsEnum(FundType)
  type: FundType;

  @ApiPropertyOptional({ example: 'Fonctionnement général' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 45000000,
    description: 'Objectif de collecte (fonds affecté)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  goal?: number;

  @ApiPropertyOptional({
    example: 500000,
    description: 'Seuil prudentiel minimum déclaré',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  prudentialFloor?: number;

  @ApiPropertyOptional({ example: 'CA 14/03/2026' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  boardDecisionRef?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}
