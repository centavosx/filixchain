import {
  BadRequestException,
  HttpException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { Account, Block, Blockchain, RawBlock } from '@ph-blockchain/block';
import { MempoolService } from '../mempool/mempool.service';

@Injectable()
export class BlockService implements OnModuleInit {
  private activeBlockHash: string;
  private currentHeight: number;
  private targetHash: string;
  private isAvailableForMining = true;

  constructor(private readonly mempoolService: MempoolService) {}

  async onModuleInit() {
    await Account.initialize();
    await Blockchain.initialize();
    const block = await Blockchain.getLatestBlock();
    this.activeBlockHash = !block ? Blockchain.genesisHash : block.blockHash;
    this.currentHeight = !block ? 0 : +block.height;
    await this.getTargetHashFromBlock(block);
  }

  checkAndRejectBlockMining() {
    if (!this.isAvailableForMining)
      throw new BadRequestException('Not available for mining');
  }

  async getTargetHashFromBlock(block?: Block) {
    if (!block) {
      this.targetHash = Blockchain.calculateTargetHash([]);
      return;
    }
    if (block.height % Blockchain.RESET_NUMBER_OF_BLOCK !== 0) return;
    const blocks = await Blockchain.getBlocksFromLatest();
    this.targetHash = Blockchain.calculateTargetHash(blocks);
  }

  /**
   *  To validate block if it matches with the current chain state.
   */
  validateBlockState(block: Block) {
    if (block.previousHash !== this.activeBlockHash)
      throw new Error('Previous hash is not valid');

    if (block.targetHash !== this.targetHash)
      throw new Error('Block contains invalid target hash');

    if (block.height !== this.currentHeight)
      throw new Error('Block is not synced to the latest height');

    // If block time is two minutes ahead or behind the current time then it is not a valid block
    if (Math.abs(block.timestamp - Date.now()) > 120000) {
      throw new Error('Block is one minute ahead or behind the current time');
    }
  }

  async saveToDb(block: Block) {
    const {
      transactions,
      write: commitBlock,
      close: rejectCommit,
    } = await Blockchain.saveBlock(block);

    this.checkAndRejectBlockMining();

    try {
      const mappedAccount = new Map<string, Account>();

      for (const transaction of transactions) {
        const rawFromAddress = transaction.rawFromAddress;
        const rawToAddress = transaction.rawToAddress;
        let fromAccount = mappedAccount.get(rawFromAddress);
        let toAccount = mappedAccount.get(rawToAddress);

        if (!fromAccount) {
          fromAccount = await Account.findByAddress(rawFromAddress);
          mappedAccount.set(rawFromAddress, fromAccount);
        }

        if (!toAccount) {
          toAccount = await Account.findByAddress(rawFromAddress);
          mappedAccount.set(rawFromAddress, toAccount);
        }

        this.checkAndRejectBlockMining();

        fromAccount.addTransaction(transaction);
        toAccount.receiveTransaction(transaction);
      }

      this.checkAndRejectBlockMining();

      const { write: commitAccounts } = await Account.save(block.timestamp, [
        ...mappedAccount.values(),
      ]);

      this.checkAndRejectBlockMining();
      await Promise.all([commitBlock(), commitAccounts()]);
      this.mempoolService.updateMempoolState(transactions);
    } catch (e) {
      await rejectCommit();

      if (e instanceof HttpException) throw e;

      throw new Error('Block contains invalid transactions');
    }
  }

  async addBlockInChain(rawBlock: RawBlock) {
    this.checkAndRejectBlockMining();

    const {
      version,
      height,
      timestamp,
      transactions,
      previousHash,
      targetHash,
      blockHash,
      nonce,
      merkleRoot,
      transactionSize,
    } = rawBlock;

    const block = new Block(
      version,
      height,
      timestamp,
      transactions,
      targetHash,
      previousHash,
      nonce,
    );

    // To make sure that the generated blockhash, merkleroot, or size matches the specified value
    if (
      block.blockHash !== blockHash ||
      block.merkleRoot !== merkleRoot ||
      block.transactionSize !== transactionSize
    )
      throw new Error(
        `Invalid block, provided details didnt meet the blockhash`,
      );

    this.validateBlockState(block);

    await this.saveToDb(block);
    await this.getTargetHashFromBlock(block);
  }
}
