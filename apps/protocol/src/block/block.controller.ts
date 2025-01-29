import { Controller, Get, Query } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockHeightQuery } from '../dto/block.dto';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  public getBlock(@Query() data: BlockHeightQuery) {
    return this.blockService.getBlocks(data);
  }

  @Get('health')
  public getSupply() {
    return this.blockService.getSupply();
  }
}
