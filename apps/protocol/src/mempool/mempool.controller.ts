import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import { Parameter } from '../utils/parameter';
import { MempoolDto } from './mempool.dto';
import { MempoolService } from './mempool.service';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@ApiBearerAuth(Session.HEADER_REFRESH_KEY.toLowerCase())
@ApiTags('Mempool')
@Controller('mempool')
export class MempoolController {
  constructor(private readonly mempoolService: MempoolService) {}

  @Get()
  getMempool() {
    return this.mempoolService.getMempool();
  }

  @Get(`/address/${Parameter.address.path}`)
  getMempoolFromAddress(@Param(Parameter.address.key) address: string) {
    return this.mempoolService.getMempoolFromAddress(address);
  }

  @Post('subscribe')
  postToMempool(@Body() data: MempoolDto) {
    return this.mempoolService.postToMempool(data.transaction);
  }
}
