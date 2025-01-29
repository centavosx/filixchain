import { Controller, Get, Query } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockHeightQuery, BlockTransactionQuery } from '../dto/block.dto';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  public getBlocks(@Query() data: BlockHeightQuery) {
    return this.blockService.getBlocks(data);
  }

  @Get('health')
  public getHealth() {
    return this.blockService.getHealth();
  }

  @Get('transactions')
  public getTransactions(@Query() data: BlockTransactionQuery) {
    return this.blockService.getTransactions(data);
  }
}
