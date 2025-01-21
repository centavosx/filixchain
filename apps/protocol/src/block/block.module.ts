import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { BlockGateway } from './block.gateway';

@Module({
  controllers: [BlockController],
  providers: [BlockService, BlockGateway],
  exports: [BlockGateway],
})
export class BlockModule {}
