import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';

const getClientIp = (req: Request) => {
  if (req.headers['cf-connecting-ip']) {
    const connectingIp = req.headers['cf-connecting-ip'];
    return Array.isArray(connectingIp) ? connectingIp[0] : connectingIp;
  }

  if (req.headers['x-forwarded-for']) {
    const forwardedIp = req.headers['x-forwarded-for'];
    return Array.isArray(forwardedIp) ? forwardedIp[0] : forwardedIp;
  }

  return req.ips.length ? req.ips[0] : req.ip;
};

@Injectable()
export class ThrottlerProxyGuard extends ThrottlerGuard {
  private logger = new Logger('HTTP');
  protected async getTracker(req: Request): Promise<string> {
    const ip = getClientIp(req);
    return ip;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = getClientIp(request);

    this.logger.log(`Request from IP: ${ip}`);

    if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') {
      this.logger.log(`Skipping rate limiting for IP: ${ip}`);
      return true;
    }

    return false;
  }
}
