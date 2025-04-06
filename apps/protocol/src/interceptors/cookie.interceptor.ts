import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Session } from '@ph-blockchain/session';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  private session: Session;

  constructor(private readonly configService: ConfigService) {
    this.session = new Session(configService.get('SESSION_SECRET_KEY'));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap(async (data) => {
        const res = context.switchToHttp().getResponse<Response>();

        const { accessToken, refreshToken } =
          await this.session.generateTokens();

        res.cookie(Session.COOKIE_ACCESS_KEY, accessToken, {
          maxAge: 10_800_000,
          sameSite: 'strict',
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
        });

        res.cookie(Session.COOKIE_REFRESH_KEY, refreshToken, {
          maxAge: 10_800_000,
          sameSite: 'strict',
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
        });

        return data;
      }),
    );
  }
}
