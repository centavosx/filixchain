import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Csrf } from '@ph-blockchain/csrf';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private csrf: Csrf;
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.csrf = new Csrf(configService.get('CSRF_SECRET_KEY'));
    if (configService.get('NODE_ENV') === 'development') {
      this.csrf
        .generateTokenAndNonce('1yr')
        .then((token) => console.log('YOUR TEST TOKEN:', token));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { csrf: { token: string; nonce: string } }>();

    const rawCsrfToken = request.headers['x-xsrf-token'];
    const rawCsrfNonce = request.headers['x-xsrf-nonce'];
    const userAgent = request.headers['user-agent'];

    if (
      !rawCsrfToken ||
      !(
        /Mozilla\/5.0\s\((Macintosh|Windows|Linux|iPhone|Android).*\)/.test(
          userAgent,
        ) || userAgent === 'Peso-In-Blockchain-Server/1.0'
      )
    )
      return false;

    const isCsrfRefresh = this.reflector.get<boolean>(
      'csrf-refresh',
      context.getHandler(),
    );

    const csrfToken = String(rawCsrfToken);

    if (!isCsrfRefresh) {
      const isValid = await this.csrf.isValidToken(String(csrfToken));
      return isValid;
    }

    if (!rawCsrfNonce) return false;

    const csrfNonce = String(rawCsrfNonce);
    const isValid = await this.csrf.isValidTokenAndNonce(csrfToken, csrfNonce);

    if (!isValid) return false;

    request.csrf = {
      token: csrfToken,
      nonce: csrfNonce,
    };

    return true;
  }
}
