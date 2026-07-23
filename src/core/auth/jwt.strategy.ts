import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ClsService } from 'nestjs-cls';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly cls: ClsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /**
   * Appelé une fois le jeton vérifié. C'est ici que le contexte tenant devient
   * fiable : il provient du JWT signé, plus d'un en-tête que le client choisit.
   */
  validate(payload: JwtPayload): JwtPayload {
    this.cls.set('tenantId', payload.tenantId);
    this.cls.set('userId', payload.sub);
    return payload;
  }
}
