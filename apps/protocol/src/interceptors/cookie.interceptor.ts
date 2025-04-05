import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Csrf } from '@ph-blockchain/csrf';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  private csrf: Csrf;

  constructor(private readonly configService: ConfigService) {
    this.csrf = new Csrf(configService.get('CSRF_SECRET_KEY'));
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap(async (data) => {
        const res = context.switchToHttp().getResponse<Response>();

        const { token, nonce } = await this.csrf.generateTokenAndNonce();

        res.cookie('session', token, {
          maxAge: 5000,
          sameSite: 'strict',
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
        });

        res.cookie('nonce', nonce, {
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
