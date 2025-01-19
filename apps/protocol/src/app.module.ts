import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MempoolModule } from './mempool/mempool.module';

@Module({
  imports: [MempoolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
