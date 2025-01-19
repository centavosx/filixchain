import { Body, Controller, Get, Post } from '@nestjs/common';
import { MempoolService } from './mempool.service';
import { MempoolDto } from './mempool.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Mempool')
@Controller('mempool')
export class MempoolController {
  constructor(private readonly mempoolService: MempoolService) {}

  @Get()
  getMempool() {
    return this.mempoolService.getMempool();
  }

  @Post('subscribe')
  postToMempool(@Body() data: MempoolDto) {
    return this.mempoolService.postToMempool(data.transaction);
  }
}
