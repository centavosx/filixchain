import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Session } from '@ph-blockchain/session';
import { AccountTransactionSearchDto } from '../dto/account-tx-search.dto';
import { Parameter } from '../utils/parameter';
import { AccountService } from './account.service';

@ApiBearerAuth(Session.HEADER_ACCESS_KEY.toLowerCase())
@ApiBearerAuth(Session.HEADER_REFRESH_KEY.toLowerCase())
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
