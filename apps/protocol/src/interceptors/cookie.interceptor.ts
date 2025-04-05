import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
      tap(async () => {
        const res = context.switchToHttp().getResponse<Response>();
        const newToken = await this.csrf.generateToken();
        res.cookie('session', newToken, {
          maxAge: 5000,
          sameSite: 'strict',
          httpOnly: true,
          secure: this.configService.get('NODE_ENV') === 'production',
        });
      }),
    );
  }
}
