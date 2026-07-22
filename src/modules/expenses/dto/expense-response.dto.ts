import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'FR-2026-0001' })
  reference: string;

  @ApiProperty({ example: 'Carburant mission Yamoussoukro' })
  label: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({ example: 45000 })
  amount: number;

  @ApiProperty({ example: 'XOF' })
  currency: string;

  @ApiProperty({ example: 'Transport' })
  category: string;

  @ApiProperty({
    example: 'DRAFT',
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'],
  })
  status: string;

  @ApiProperty({ example: '2026-07-08' })
  expenseDate: string;

  @ApiPropertyOptional({ example: 'Chorale' })
  department?: string | null;

  @ApiPropertyOptional({ example: 'Fonds general' })
  fund?: string | null;

  @ApiProperty({ example: 'Awa Comptable' })
  requester: string;

  @ApiProperty()
  createdAt: Date;
}
