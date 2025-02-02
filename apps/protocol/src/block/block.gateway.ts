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
import { Minter, Transaction } from '@ph-blockchain/block';
import { Block } from '@ph-blockchain/block';
import { Server, Socket } from 'socket.io';
import { BlockGatewayFilter } from './block.filter';
import { InitAccountDto, RawBlockDto } from './block.dto';
import { Blockchain } from '../db/blockchain';
import { Account } from '../db/account';

@WebSocketGateway()
@UseFilters(BlockGatewayFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class BlockGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private MINER_ROOM = 'miner';
  private ACCOUNT_ROOM_PREFIX = 'account-';
  private NODE_ROOM = 'node';

  public activeBlockHash: string;
  public currentHeight: number;
  public targetHash: string;

  private isValidatingMiner = false;

  public mempoolMap = new Map<string, Map<string, Transaction>>();
  public mempoolQueue = new Map<string, Transaction>();
  public currentEncodedTxToMine: string[] = [];
  public mintNonce = 0;

  public currentSupply = Blockchain.MAX_SUPPLY;

  private blockedClients = new Set<string>();

  async onModuleInit() {
    await Account.initialize();
    await Blockchain.initialize();
    const block = await Blockchain.getLatestBlock();

    this.handleReset(block, true);
  }

  async handleReset(block?: Block, isInit?: boolean) {
    const supply = await Blockchain.getSupply();
    const account = await Account.findByAddress(Minter.rawFromAddress);
    const targetHash = await this.getTargetHashFromBlock(block, isInit);
    this.currentEncodedTxToMine = [...this.mempoolQueue.values()]
      .slice(0, Block.MAX_TX_SIZE)
      .map((value) => value.encode());

    if (!!targetHash) {
      this.targetHash = targetHash;
    }
    this.mintNonce = Number(account.nonce);
    this.currentSupply = supply;
    this.isValidatingMiner = false;
    this.activeBlockHash = !block ? Blockchain.genesisHash : block.blockHash;
    this.currentHeight = !block ? 0 : +block.height + 1;
    this.blockedClients.clear();
    this.sendAvailabilityNotification(true);
  }

  sendAvailabilityNotification(isNewBlock: boolean, socket?: Socket) {
    (socket ?? this.server.to(this.MINER_ROOM)).emit('new-block-info', {
      isNewBlock,
      details: {
        mintNonce: this.mintNonce,
        currentSupply: Number(this.currentSupply),
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

  @SubscribeMessage('init-account')
  handleInitAccount(
    @ConnectedSocket() client: Socket,
    @Body() dto: InitAccountDto,
  ) {
    client.join(`${this.ACCOUNT_ROOM_PREFIX}${dto.address.toLowerCase()}`);
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

    let accountAddresses: string[] | undefined;

    try {
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
        block.transactionSize !== transactionSize ||
        transactions.length !== transactionSize
      )
        throw new Error(
          `Invalid block, provided details didnt meet the blockhash`,
        );

      this.validateBlockState(block);

      const {
        totalMinerReward,
        transactions: userTransactions,
        blockHash: minedBlockHash,
      } = await this.saveToDb(block, mintAddress);
      await this.handleReset(block);

      accountAddresses = this.updateMempoolState(
        mintAddress,
        block,
        userTransactions,
      );
      client.emit('mine-success', {
        hash: minedBlockHash,
        earned: totalMinerReward.toString(),
      });

      this.server.emit('block', block.toJson(true));
    } catch (e) {
      this.blockedClients.add(client.id);
      this.sendAvailabilityNotification(false);
      this.isValidatingMiner = false;
      throw new BadRequestException(e.message);
    }

    if (accountAddresses) {
      const accounts = await Account.findByAddress(accountAddresses);
      for (const account of accounts) {
        this.sendTo('accountInfo', account.address, account.serialize());
      }
    }
  }

  public sendTo(key: string, address: string, data: unknown) {
    this.server
      .to(`${this.ACCOUNT_ROOM_PREFIX}${address.toLowerCase()}`)
      .emit(key, data);
  }

  /**
   * Block necessary methods below
   */

  updateMempoolState(
    mintAddress: string,
    block: Block,
    trasactions: Transaction[],
  ) {
    let addresses = new Set<string>([mintAddress]);
    for (const transaction of trasactions) {
      transaction.addBlock(block);

      const transactionId = transaction.transactionId;
      const rawFromAddress = transaction.rawFromAddress;
      const rawToAddress = transaction.rawToAddress;
      const addressMempool = this.mempoolMap.get(rawFromAddress);

      addresses.add(rawFromAddress);
      addresses.add(rawToAddress);

      this.sendTo('transaction', rawFromAddress, transaction.serialize());

      if (rawFromAddress !== rawToAddress) {
        this.sendTo('transaction', rawToAddress, transaction.serialize());
      }

      addressMempool?.delete(transactionId);
      this.mempoolQueue?.delete(transactionId);
    }
    return [...addresses.values()];
  }

  async getLatestBlock() {
    return Blockchain.getLatestBlock();
  }

  async getTargetHashFromBlock(block?: Block, isInit?: boolean) {
    const height = block?.height || 0;
    const lastHeight = height - (height % Blockchain.RESET_NUMBER_OF_BLOCK);

    if (!block || (lastHeight <= 0 && isInit)) {
      return Blockchain.calculateTargetHash([]);
    }

    if (
      !isInit &&
      (!block.height || block.height % Blockchain.RESET_NUMBER_OF_BLOCK !== 0)
    )
      return null;

    const blocks = await Blockchain.getBlocksFromLatest();
    return Blockchain.calculateTargetHash(blocks);
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

  async saveToDb(block: Block, mintAddress: string) {
    const { minerRewards, transactions } = await Blockchain.saveBlock(
      block,
      mintAddress,
    );

    return {
      blockHash: block.blockHash,
      totalMinerReward: minerRewards,
      transactions: transactions.filter(
        (value) => value instanceof Transaction,
      ),
    };
  }
}
