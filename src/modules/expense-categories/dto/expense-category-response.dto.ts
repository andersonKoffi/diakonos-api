import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseCategoryResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Transport' })
  name: string;

  @ApiPropertyOptional({ example: 'Déplacements et missions' })
  description: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}
