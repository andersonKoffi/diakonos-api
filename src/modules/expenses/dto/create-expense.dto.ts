import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Carburant mission Yamoussoukro' })
  @IsString()
  @MaxLength(200)
  label: string;

  @ApiPropertyOptional({ example: 'Aller-retour pour la convention régionale' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 45000,
    description: 'Montant dans la devise choisie',
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Identifiant de la devise (voir /currencies)' })
  @IsUUID()
  currencyId: string;

  @ApiProperty({ description: 'Identifiant de la catégorie de dépense' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: '2026-07-08', description: 'Date de la dépense' })
  @IsDateString()
  expenseDate: string;

  @ApiPropertyOptional({ description: 'Département rattaché' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Fonds imputé' })
  @IsOptional()
  @IsUUID()
  fundId?: string;
}
