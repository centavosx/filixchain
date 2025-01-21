import { Module } from '@nestjs/common';
import { MempoolController } from './mempool.controller';
import { MempoolService } from './mempool.service';
import { BlockModule } from '../block/block.module';

@Module({
  imports: [BlockModule],
  controllers: [MempoolController],
  providers: [MempoolService],
  exports: [MempoolService],
})
export class MempoolModule {}
