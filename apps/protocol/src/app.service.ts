import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SearchDto } from './dto/search-dto';
import { BlockGateway } from './block/block.gateway';
import { DbService } from './db/db.service';
import { Transform } from '@ph-blockchain/transformer';
import {
  Block,
  SignAccount,
  Transaction,
  WalletAccount,
} from '@ph-blockchain/block';
import { catchError } from './utils/catch-error';
import { ConfigService } from './config/config.service';
import { MempoolService } from './mempool/mempool.service';
import { AccountService } from './account/account.service';
import { FaucetDto } from './dto/faucet.dto';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AppService {
  private signedAccount: SignAccount;
  constructor(
    private readonly configService: ConfigService,
    private readonly blockGateway: BlockGateway,
    private readonly dbService: DbService,
    private readonly mempoolService: MempoolService,
    private readonly accountService: AccountService,
    private readonly redisService: RedisService,
  ) {
    const wallet = new WalletAccount(configService.get('FAUCET_KEY'));
    wallet.init().then(() => {
      this.signedAccount = wallet.getSignedAccount();
    });
  }

  async search(dto: SearchDto) {
    const value = dto.search.trim();

    if (/^[0-9a-fA-F]{64}$/.test(value)) {
      const transactionFromMempoolQueue =
        this.blockGateway.mempoolQueue.get(value);

      if (!!transactionFromMempoolQueue) {
        return {
          type: 'mempool',
          value,
        };
      }

      const transaction = await catchError(
        async () => await this.dbService.blockchain.findTransactionsById(value),
      );

      if (!!transaction) {
        return {
          type: 'transaction',
          value,
        };
      }

      const block = await catchError(
        async () => await this.dbService.blockchain.findBlockByHash(value),
      );

      if (!!block) {
        return {
          type: 'height',
          value: block.height.toString(),
        };
      }
    }

    const valueWithoutPrefix = Transform.removePrefix(
      value.trim(),
      Transaction.prefix,
    ).trim();

    if (/^[0-9a-fA-F]{40}$/.test(valueWithoutPrefix)) {
      const account = await catchError(
        async () =>
          await this.dbService.account.findByAddress(valueWithoutPrefix),
      );

      if (!!account) {
        return {
          type: 'account',
          value: account.address,
        };
      }
    }

    if (isFinite(Number(value))) {
      const blockUsingHeight = await catchError(
        async () =>
          await this.dbService.blockchain.getBlockByHeight(Number(value)),
      );

      if (!!blockUsingHeight) {
        return {
          type: 'height',
          value: blockUsingHeight.height.toString(),
        };
      }
    }

    throw new NotFoundException('Not found');
  }

  async faucet(dto: FaucetDto, ip: string) {
    const isValid = await this.redisService.limitIncrementValid(`faucet-${ip}`);

    if (!isValid) {
      throw new BadRequestException(
        'You have reached the faucet limit for today. Please try again tomorrow.',
      );
    }

    const rawAddress = Transform.removePrefix(
      this.signedAccount.walletAddress,
      Transaction.prefix,
    );

    const pendingTx = this.mempoolService.getMempoolFromAddress(rawAddress);
    const account = await this.accountService.getAccountFromAddress(rawAddress);

    const currentNonce = Number(account.nonce) + pendingTx.data.length;

    const transaction = new Transaction({
      from: this.signedAccount.walletAddress,
      to: Transform.addPrefix(dto.address, Transaction.prefix),
      amount: Transform.toLowestUnit(10),
      nonce: currentNonce,
      version: Block.version,
    });

    const encodedTransaction = transaction
      .sign(this.signedAccount.keyPairs.secretKey)
      .encode();

    return await this.mempoolService.postToMempool([encodedTransaction]);
  }
}
