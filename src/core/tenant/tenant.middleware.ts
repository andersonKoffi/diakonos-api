import { Injectable, NestMiddleware } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // TODO: dériver le tenant du JWT une fois l'auth en place
    const raw = req.headers['x-tenant-id'];

    if (typeof raw === 'string' && raw.trim().length > 0) {
      this.cls.set('tenantId', raw.trim());
    }

    next();
  }
}
