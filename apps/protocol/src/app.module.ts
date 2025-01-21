import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MempoolModule } from './mempool/mempool.module';
import { AccountModule } from './account/account.module';
import { BlockModule } from './block/block.module';

@Module({
  imports: [MempoolModule, AccountModule, BlockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
