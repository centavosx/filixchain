import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Session } from '@ph-blockchain/session';
import { Request } from 'express';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private session: Session;
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.session = new Session(configService.get('SESSION_SECRET_KEY'));
    if (configService.get('NODE_ENV') === 'development') {
      this.session
        .generateTokens('1yr')
        .then((token) => console.log('YOUR TEST TOKEN:', token));
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request & { session: { accessToken: string; refreshToken: string } }
      >();

    let rawAccessToken =
      request.headers[Session.HEADER_ACCESS_KEY.toLowerCase()];
    let rawRefreshToken =
      request.headers[Session.HEADER_REFRESH_KEY.toLowerCase()];

    const cookies = request.cookies;

    if (!!request.headers.cookie) {
      rawAccessToken = cookies[Session.COOKIE_ACCESS_KEY];
      rawRefreshToken = cookies[Session.COOKIE_REFRESH_KEY];
    }

    const userAgent = request.headers['user-agent'];

    if (
      !rawAccessToken ||
      !(
        /Mozilla\/5.0\s\((Macintosh|Windows|Linux|iPhone|Android).*\)/.test(
          userAgent,
        ) || userAgent === 'Peso-In-Blockchain-Server/1.0'
      )
    )
      return false;

    const isRefresh = this.reflector.get<boolean>(
      'token-refresh',
      context.getHandler(),
    );

    const accessToken = String(rawAccessToken);

    if (!isRefresh) {
      const isValid = await this.session.isValidToken(String(accessToken));
      return isValid;
    }

    if (!rawRefreshToken) return false;

    const refreshToken = String(rawRefreshToken);

    const isValid = await this.session.isValidTokens(accessToken, refreshToken);

    if (!isValid) return false;

    request.session = {
      accessToken,
      refreshToken,
    };

    return true;
  }
}
