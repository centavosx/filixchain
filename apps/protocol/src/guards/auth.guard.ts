import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Csrf } from '@ph-blockchain/csrf';
import { ConfigService } from '../config/config.service';

// Global guard.
@Injectable()
export class AuthGuard implements CanActivate {
  private csrf: Csrf;
  constructor(configService: ConfigService) {
    this.csrf = new Csrf(configService.get('CSRF_SECRET_KEY'));
    if (configService.get('NODE_ENV') === 'development') {
      this.csrf
        .generateToken('1yr')
        .then((token) => console.log('YOUR TEST TOKEN:', token));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const csrfToken = request.headers['x-csrf-token'];

    if (!csrfToken) return false;

    const isValid = await this.csrf.isValidToken(String(csrfToken));

    return isValid;
  }
}
