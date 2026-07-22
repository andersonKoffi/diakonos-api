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

  @ApiProperty()
  currencyId: string;

  @ApiProperty({ example: 'Transport' })
  category: string;

  @ApiProperty()
  categoryId: string;

  @ApiPropertyOptional({
    example: 'MOBILE_MONEY',
    enum: ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHEQUE', 'CARD'],
  })
  paymentMethod?: string | null;

  @ApiProperty({
    example: 'DRAFT',
    enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID'],
  })
  status: string;

  @ApiProperty({ example: '2026-07-08' })
  expenseDate: string;

  @ApiPropertyOptional({ example: 'Chorale' })
  department?: string | null;

  @ApiPropertyOptional()
  departmentId?: string | null;

  @ApiPropertyOptional({ example: 'Fonds general' })
  fund?: string | null;

  @ApiPropertyOptional()
  fundId?: string | null;

  @ApiPropertyOptional({
    example: 'UNRESTRICTED',
    enum: ['UNRESTRICTED', 'RESTRICTED'],
  })
  fundType?: string | null;

  @ApiProperty({ example: 'Awa Comptable' })
  requester: string;

  @ApiProperty()
  requesterId: string;

  @ApiPropertyOptional({ description: 'Date de soumission pour validation' })
  submittedAt?: Date | null;

  @ApiPropertyOptional({ example: 'Koffi Tresorier' })
  approvedBy?: string | null;

  @ApiPropertyOptional()
  approvedAt?: Date | null;

  @ApiPropertyOptional({ description: 'Motif en cas de rejet' })
  rejectionReason?: string | null;

  @ApiProperty()
  createdAt: Date;
}
