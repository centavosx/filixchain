import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { BlockModule } from './block/block.module';
import { ConfigModule } from './config/config.module';
import { DbModule } from './db/db.module';
import { MempoolModule } from './mempool/mempool.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
    DbModule,
    MempoolModule,
    AccountModule,
    BlockModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
