import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FundType } from '../../../generated/prisma/enums';

export class FundResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Fonds general' })
  name: string;

  @ApiProperty({ enum: FundType })
  type: FundType;

  @ApiPropertyOptional({ example: 'Fonctionnement général' })
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({
    example: 4820000,
    description:
      'Solde calculé : somme des offrandes/dons reçus - somme des frais remboursés (PAID) rattachés à ce fonds.',
  })
  balance: number;

  @ApiPropertyOptional({ example: 45000000 })
  goal: number | null;

  @ApiPropertyOptional({ example: 500000 })
  prudentialFloor: number | null;

  @ApiPropertyOptional({ example: 'CA 14/03/2026' })
  boardDecisionRef: string | null;

  @ApiProperty()
  closed: boolean;

  @ApiProperty()
  createdAt: Date;
}
