import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    // Client de base (hors RLS) : l'authentification a lieu AVANT de connaître le tenant.
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { tenantRoles: { include: { tenant: true } } },
    });

    // Message volontairement identique dans tous les cas d'échec :
    // ne jamais révéler si l'email existe.
    const invalid = new UnauthorizedException('Identifiants invalides');
    if (!user || !user.isActive || user.deletedAt) throw invalid;

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) throw invalid;

    const membership = user.tenantRoles[0];
    if (!membership) throw invalid;

    const roles = user.tenantRoles
      .filter((r) => r.tenantId === membership.tenantId)
      .map((r) => r.role);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: membership.tenantId,
      roles,
    };

    // Durées de vie exprimées en secondes.
    const accessTtl = Number(this.config.get('JWT_ACCESS_TTL') ?? 900);
    const refreshTtl = Number(this.config.get('JWT_REFRESH_TTL') ?? 2592000);

    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      }),
      refreshToken: await this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      }),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        tenantName: membership.tenant.name,
        roles,
      },
    };
  }
}
