import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { BlockModule } from './block/block.module';
import { ConfigModule } from './config/config.module';
import { DbModule } from './db/db.module';
import { MempoolModule } from './mempool/mempool.module';
import { RedisModule } from './redis/redis.module';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerProxyGuard } from './guards/throttler-proxy.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 120,
      },
    ]),
    ConfigModule,
    RedisModule,
    DbModule,
    MempoolModule,
    AccountModule,
    BlockModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerProxyGuard,
    },
    AppService,
  ],
})
export class AppModule {}
