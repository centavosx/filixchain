import { ConfigModule } from './config/config.module';
import { DbModule } from './db/db.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MempoolModule } from './mempool/mempool.module';
import { AccountModule } from './account/account.module';
import { BlockModule } from './block/block.module';
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
  providers: [AppService],
})
export class AppModule {}
