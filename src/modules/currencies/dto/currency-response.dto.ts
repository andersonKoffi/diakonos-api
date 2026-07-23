import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'XOF' })
  code: string;

  @ApiProperty({ example: 'Franc CFA (UEMOA)' })
  name: string;

  @ApiPropertyOptional({ example: 'CFA' })
  symbol: string | null;

  @ApiProperty({ example: 2 })
  decimals: number;

  @ApiProperty()
  isActive: boolean;
}
