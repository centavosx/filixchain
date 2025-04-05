import { Global, Module } from '@nestjs/common';
import { FactoryProvider } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from './redis.service';
import { ConfigService } from '../config/config.service';

const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: (configService: ConfigService) => {
    const redisInstance = new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      password: configService.get('REDIS_PASS'),
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisClientFactory, RedisService],
  exports: [redisClientFactory, RedisService],
})
export class RedisModule {}
