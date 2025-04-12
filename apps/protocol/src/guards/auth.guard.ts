import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Session } from '@ph-blockchain/session';
import { Request, Response } from 'express';
import { ConfigService } from '../config/config.service';
import { RedisService } from '../redis/redis.service';
import { AppHash } from '@ph-blockchain/hash';

@Injectable()
export class AuthGuard implements CanActivate {
  private session: Session;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.session = new Session(configService.get('SESSION_SECRET_KEY'));
    if (configService.get('NODE_ENV') === 'development') {
      this.session
        .generateToken()
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

    const cookies = request.cookies;

    if (!!request.headers.cookie) {
      rawAccessToken = cookies[Session.COOKIE_ACCESS_KEY];
    }

    const userAgent = request.headers['user-agent'];

    if (
      !rawAccessToken ||
      !(
        /Mozilla\/5.0\s\((Macintosh|Windows|Linux|iPhone|Android).*\)/.test(
          userAgent,
        ) || userAgent === this.configService.get('SERVER_USER_AGENT')
      )
    )
      return false;

    const accessToken = String(rawAccessToken);

    const hashedToken = AppHash.createSha256Hash(accessToken);

    // Check if token exists meaning it is invalidated
    const isInvalidated = await this.redisService.get(`token-${hashedToken}`);

    const isValid =
      !isInvalidated && (await this.session.isValidToken(accessToken));

    if (!isValid) {
      const response = context.switchToHttp().getResponse<Response>();
      response.clearCookie(Session.COOKIE_ACCESS_KEY);
    }

    return isValid;
  }
}
