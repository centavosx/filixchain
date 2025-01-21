import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MempoolModule } from './mempool/mempool.module';
import { AccountModule } from './account/account.module';

@Module({
  imports: [MempoolModule, AccountModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
