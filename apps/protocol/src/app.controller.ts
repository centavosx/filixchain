import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { AppHash } from '@ph-blockchain/hash';
import { GetSession } from './decorators/get-session.decorator';
import { IsRefresh } from './decorators/is-refresh.decorator';
import { RedisService } from './redis/redis.service';

import { ApiBearerAuth } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@ApiBearerAuth(Session.HEADER_REFRESH_KEY.toLowerCase())
@Controller()
export class AppController {
  constructor(private redisService: RedisService) {}

  @IsRefresh()
  @Get('refresh')
  async refresh(
    @GetSession() session: { accessToken: string; refreshToken: string },
  ) {
    const hashedRefreshToken = AppHash.createSha256Hash(session.refreshToken);

    const data = await this.redisService.get<string>(hashedRefreshToken);

    if (!!data) {
      throw new ForbiddenException();
    }
    const hashedAccessToken = AppHash.createSha256Hash(session.accessToken);

    await this.redisService.set(hashedRefreshToken, hashedAccessToken);

    return;
  }
}
