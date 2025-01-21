import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Parameter } from '../utils/parameter';
import { AccountService } from './account.service';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(Parameter.address.path)
  getMempool(@Param(Parameter.address.key) address: string) {
    return this.accountService.getAccountFromAddress(address);
  }
}
