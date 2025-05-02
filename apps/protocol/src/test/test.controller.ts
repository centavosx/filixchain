import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import { TestService } from './test.service';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@ApiTags('Test')
@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  post() {
    return this.testService.add();
  }

  @Get()
  get() {
    return this.testService.get();
  }
}
