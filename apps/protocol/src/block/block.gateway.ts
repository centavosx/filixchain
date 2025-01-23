import {
  BadRequestException,
  Body,
  ConflictException,
  ForbiddenException,
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
import { Account, Block, Blockchain } from '@ph-blockchain/block';
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

  private isValidatingMiner = false;

  public mempoolMap = new Map<string, Map<string, Transaction>>();
  public mempoolQueue = new Map<string, Transaction>();
  public currentEncodedTxToMine: string[] = [];

  private blockedClients = new Set<string>();

  async onModuleInit() {
    await Account.initialize();
    await Blockchain.initialize();
    const block = await Blockchain.getLatestBlock();
    this.activeBlockHash = !block ? Blockchain.genesisHash : block.blockHash;
    this.currentHeight = !block ? 0 : +block.height + 1;
    await this.getTargetHashFromBlock(block, true);
    this.handleReset();
  }

  handleReset() {
    this.currentEncodedTxToMine = [...this.mempoolQueue.values()]
      .slice(0, Block.MAX_TX_SIZE)
      .map((value) => value.encode());
    this.isValidatingMiner = false;
    this.blockedClients.clear();
    this.sendAvailabilityNotification(true);
  }

  sendAvailabilityNotification(isNewBlock: boolean, socket?: Socket) {
    (socket ?? this.server.to(this.MINER_ROOM)).emit('new-block-info', {
      isNewBlock,
      details: {
        transaction: this.currentEncodedTxToMine,
        activeBlockHash: this.activeBlockHash,
        targetHash: this.targetHash,
        currentHeight: this.currentHeight,
      },
    });
  }

  async handleConnection(client: Socket) {}

  @SubscribeMessage('init-miner')
  handleInitMiner(@ConnectedSocket() client: Socket) {
    client.join(this.MINER_ROOM);
    this.sendAvailabilityNotification(false, client);
  }

  @SubscribeMessage('submit-block')
  async addBlockInChain(
    @Body() rawBlock: RawBlockDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (this.blockedClients.has(client.id)) {
      throw new ForbiddenException(
        'You have already submitted your block. However, it has been marked as invalid. Please wait for the next block.',
      );
    }

    if (this.isValidatingMiner || this.blockedClients.has(client.id)) {
      throw new ConflictException(
        'Failed to submit, block from other miner is now being validated.',
      );
    }

    this.isValidatingMiner = true;

    try {
      const {
        version,
        height,
        transactions,
        previousHash,
        targetHash,
        blockHash,
        nonce,
        merkleRoot,
        transactionSize,
        mintAddress,
      } = rawBlock;

      const block = new Block(
        version,
        height,
        transactions,
        targetHash,
        previousHash,
        nonce,
        Date.now(),
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
      await this.saveToDb(block, mintAddress);
      this.activeBlockHash = block.blockHash;
      this.currentHeight = block.height + 1;
      this.handleReset();
    } catch (e) {
      this.blockedClients.add(client.id);
      this.sendAvailabilityNotification(false);
      this.isValidatingMiner = false;
      throw new BadRequestException(e.message);
    }
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

  async getTargetHashFromBlock(block?: Block, isInit?: boolean) {
    const height = block?.height || 0;
    const lastHeight = height - (height % Blockchain.RESET_NUMBER_OF_BLOCK);

    if (!block || (lastHeight <= 0 && isInit)) {
      this.targetHash = Blockchain.calculateTargetHash([]);
      return;
    }

    if (
      !isInit &&
      (!block.height || block.height % Blockchain.RESET_NUMBER_OF_BLOCK !== 0)
    )
      return;

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
  }

  async saveToDb(block: Block, mintAddress?: string) {
    const {
      transactions,
      write: commitBlock,
      close: rejectCommit,
    } = await Blockchain.saveBlock(block, mintAddress);

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
          toAccount = await Account.findByAddress(rawToAddress);
          mappedAccount.set(rawToAddress, toAccount);
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
      this.updateMempoolState(
        transactions.filter((value) => value instanceof Transaction),
      );
    } catch (e) {
      await rejectCommit();
      throw e;
    }
  }
}
