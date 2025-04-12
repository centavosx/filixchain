import { Controller, Get } from '@nestjs/common';

import { RedisService } from './redis/redis.service';

import { ApiBearerAuth } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@Controller()
export class AppController {
  constructor(private redisService: RedisService) {}

  @Get('health')
  async check() {
    return 'Hello world!';
  }
}
