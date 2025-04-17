import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsThrottlerProxyGuard extends ThrottlerGuard {
  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const socket = requestProps.context
      .switchToWs()
      .getClient<Socket & { uniqueId: string }>();

    const data = await this.storageService.increment(
      socket.uniqueId,
      requestProps.ttl,
      requestProps.limit,
      requestProps.blockDuration,
      requestProps.throttler.name ?? 'ws',
    );

    if (data.isBlocked) {
      throw new ThrottlerException();
    }

    return true;
  }
}
