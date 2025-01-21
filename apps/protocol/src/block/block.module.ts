import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { MempoolModule } from '../mempool/mempool.module';

@Module({
  imports: [MempoolModule],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
