import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectExpenseDto {
  @ApiProperty({ example: 'Justificatif illisible, merci de le renvoyer.' })
  @IsString()
  @MinLength(3)
  reason: string;
}
