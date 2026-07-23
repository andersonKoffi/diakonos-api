import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'comptable@msa.ci' })
  email: string;

  @ApiProperty({ example: 'Awa' })
  firstName: string;

  @ApiProperty({ example: 'Comptable' })
  lastName: string;

  @ApiProperty({ example: 'MSA Abidjan' })
  tenantName: string;

  @ApiProperty({ example: ['ACCOUNTANT'], isArray: true, type: String })
  roles: string[];
}

export class AuthResponseDto {
  @ApiProperty({ description: "Jeton d'accès JWT (Bearer)" })
  accessToken: string;

  @ApiProperty({ description: 'Jeton de rafraîchissement' })
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
