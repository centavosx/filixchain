import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Parameter } from '../utils/parameter';
import { AccountService } from './account.service';
import { AccountTransactionSearchDto } from './account.dto';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get(Parameter.address.path)
  getAccount(@Param(Parameter.address.key) address: string) {
    return this.accountService.getAccountFromAddress(address);
  }

  @Get(`${Parameter.address.path}/transactions`)
  getAccountTransactions(
    @Param(Parameter.address.key) address: string,
    @Query() query: AccountTransactionSearchDto,
  ) {
    return this.accountService.getTransactions(address, query);
  }
}
