import { Controller, Get } from '@nestjs/common';
import { MempoolService } from './mempool.service';

@Controller()
export class MempoolController {
  constructor(private readonly mempoolService: MempoolService) {}

  // @Get()
  // getHello(): string {
  //   return this.mempoolService.getHello();
  // }
}
