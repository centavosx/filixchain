import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { IsRefresh } from './decorators/is-refresh.decorator';
import { GetCsrf } from './decorators/get-csrf.decorator';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(private redisService: RedisService) {}

  @IsRefresh()
  @Get('refresh')
  async refresh(@GetCsrf() csrf: { token: string; nonce: string }) {
    const data = await this.redisService.get<string>(csrf.nonce);

    if (!!data) {
      throw new ForbiddenException();
    }

    await this.redisService.set(csrf.nonce, csrf.token);

    return;
  }
}
