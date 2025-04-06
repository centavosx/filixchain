import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import { BlockHeightQuery, BlockTransactionQuery } from '../dto/block.dto';
import { Parameter } from '../utils/parameter';
import { BlockService } from './block.service';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@ApiBearerAuth(Session.HEADER_REFRESH_KEY.toLowerCase())
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
