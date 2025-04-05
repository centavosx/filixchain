import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Parameter } from '../utils/parameter';
import { AccountService } from './account.service';
import { AccountTransactionSearchDto } from '../dto/account-tx-search.dto';

@ApiBearerAuth('csrf-token')
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
