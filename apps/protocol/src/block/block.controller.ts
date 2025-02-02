import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockHeightQuery, BlockTransactionQuery } from '../dto/block.dto';
import { Parameter } from '../utils/parameter';

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

  @Get(`height/${Parameter.height.path}`)
  public getBlockByHeight(@Param(Parameter.height.key) height: string) {
    return this.blockService.getBlockByHeight(+height);
  }

  @Get(`hash/${Parameter.hash.path}`)
  public getBlockByHash(@Param(Parameter.hash.key) hash: string) {
    return this.blockService.getBlockByHash(hash);
  }

  @Get('transaction')
  public getTransactions(@Query() data: BlockTransactionQuery) {
    return this.blockService.getTransactions(data);
  }

  @Get(`transaction/${Parameter.hash.path}`)
  public getTransactionsDetail(@Param(Parameter.hash.key) hash: string) {
    return this.blockService.getTransactionDetail(hash);
  }
}
