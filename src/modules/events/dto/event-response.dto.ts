import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../../../generated/prisma/enums';

export class EventResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Culte de dimanche' })
  name: string;

  @ApiProperty({ enum: EventType })
  type: EventType;

  @ApiPropertyOptional({ example: 'Temple central' })
  location: string | null;

  @ApiProperty()
  startsAt: Date;

  @ApiPropertyOptional()
  endsAt: Date | null;

  @ApiPropertyOptional({ example: 'Chorale' })
  department: string | null;

  @ApiPropertyOptional()
  departmentId: string | null;

  @ApiProperty()
  createdAt: Date;
}
