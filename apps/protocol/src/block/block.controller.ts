import { Controller, Get } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Get()
  public getBlock() {
    return this.blockService.getBlocks();
  }

  @Get('supply')
  public getSupply() {
    return this.blockService.getSupply();
  }
}
