import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { ApiBearerAuth } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import { AppService } from './app.service';
import { SearchDto } from './dto/search-dto';
import { FaucetDto } from './dto/faucet.dto';
import { CurrentIp } from './decorators/current-ip';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Get('health')
  async check() {
    return 'Hello world!';
  }

  @Get('search')
  async search(@Query() searchDto: SearchDto) {
    return this.appService.search(searchDto);
  }

  @Post('faucet')
  async faucet(@Body() faucetDto: FaucetDto, @CurrentIp() ip: string) {
    return this.appService.faucet(faucetDto, ip);
  }
}
