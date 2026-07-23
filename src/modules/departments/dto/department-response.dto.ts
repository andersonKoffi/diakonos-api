import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Chorale' })
  name: string;

  @ApiPropertyOptional({ example: 'CHR' })
  code: string | null;

  @ApiProperty()
  createdAt: Date;
}
