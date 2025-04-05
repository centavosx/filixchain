import { ConfigModule } from './config/config.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from './config/config.service';
import { DbModule } from './db/db.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MempoolModule } from './mempool/mempool.module';
import { AccountModule } from './account/account.module';
import { BlockModule } from './block/block.module';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASS'),
          },
        });
        return {
          store: () => store,
        };
      },
      inject: [ConfigService],
    }),
    DbModule,
    MempoolModule,
    AccountModule,
    BlockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
