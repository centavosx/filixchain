import {
  BadRequestException,
  Body,
  ConflictException,
  OnModuleInit,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Transaction } from '@ph-blockchain/block';
import { Account, Block, Blockchain, RawBlock } from '@ph-blockchain/block';
import { Server, Socket } from 'socket.io';
import { BlockGatewayFilter } from './block.filter';
import { RawBlockDto } from './block.dto';

@WebSocketGateway()
@UseFilters(BlockGatewayFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class BlockGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private MINER_ROOM = 'miner';
  private NODE_ROOM = 'node';

  public activeBlockHash: string;
  public currentHeight: number;
  public targetHash: string;
  public isAvailableForMining = true;

  private isValidatingMiner = false;

  public mempoolMap = new Map<string, Map<string, Transaction>>();
  public mempoolQueue = new Map<string, Transaction>();

  async onModuleInit() {
    await Account.initialize();
    await Blockchain.initialize();
    const block = await Blockchain.getLatestBlock();
    this.activeBlockHash = !block ? Blockchain.genesisHash : block.blockHash;
    this.currentHeight = !block ? 0 : +block.height;
    await this.getTargetHashFromBlock(block);
    this.handleReset();
  }

  handleReset() {
    setTimeout(() => {
      this.isValidatingMiner = false;
      this.sendAvailabilityNotification(true);
    }, Blockchain.BLOCK_MINE_TIME);
  }

  async handleConnection(client: Socket) {}

  @SubscribeMessage('init-miner')
  handleInitMiner(@ConnectedSocket() client: Socket) {
    client.join(this.MINER_ROOM);
  }

  @SubscribeMessage('submit-block')
  handleSubmit(@Body() data: RawBlockDto, @ConnectedSocket() client: Socket) {
    this.addBlockInChain(data);
  }

  sendAvailabilityNotification(isAvailable: boolean) {
    this.server.emit('minerAvailable', { isAvailable });
  }

  /**
   * Block necessary methods below
   */

  updateMempoolState(trasactions: Transaction[]) {
    for (const transaction of trasactions) {
      const transactionId = transaction.transactionId;
      const rawFromAddress = transaction.rawFromAddress;
      const addressMempool = this.mempoolMap.get(rawFromAddress);
      addressMempool?.delete(transactionId);
      this.mempoolQueue?.delete(transactionId);
    }
  }

  async getLatestBlock() {
    return Blockchain.getLatestBlock();
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

        fromAccount.addTransaction(transaction);
        toAccount.receiveTransaction(transaction);
      }

      const { write: commitAccounts } = await Account.save(block.timestamp, [
        ...mappedAccount.values(),
      ]);

      await Promise.all([
        commitBlock(),
        commitAccounts(),
        this.getTargetHashFromBlock(block),
      ]);
      this.updateMempoolState(transactions);
    } catch (e) {
      await rejectCommit();
      throw e;
    }
  }

  async addBlockInChain(rawBlock: RawBlock) {
    try {
      if (this.isValidatingMiner) {
        throw new ConflictException('Not available for mining');
      }

      this.isValidatingMiner = true;
      this.sendAvailabilityNotification(false);

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
      this.activeBlockHash = block.blockHash;
      this.currentHeight = block.height;
      this.handleReset();
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      }

      this.isValidatingMiner = false;
      throw new BadRequestException(e.message);
    }
  }
}
