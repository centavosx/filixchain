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
import { Minter, MintOrTx, Transaction } from '@ph-blockchain/block';
import { Block } from '@ph-blockchain/block';
import { Server, Socket } from 'socket.io';
import { BlockGatewayFilter } from './block.filter';
import { InitAccountDto, RawBlockDto } from './block.dto';
import { DbService } from '../db/db.service';
import * as cookie from 'cookie';
import { Session } from '@ph-blockchain/session';
import { ConfigService } from '../config/config.service';
import { BlockGatewayException } from './block.exception';
import { RedisService } from '../redis/redis.service';
import { AppHash } from '@ph-blockchain/hash';

type WsClient = Socket & {
  type: 'miner' | 'user';
  token?: string;
};

@WebSocketGateway()
@UseFilters(BlockGatewayFilter)
@UsePipes(new ValidationPipe({ transform: true }))
export class BlockGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private filterException = new BlockGatewayFilter();

  public currentSupply: bigint;

  private session: Session;

  constructor(
    private readonly dbService: DbService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.currentSupply = dbService.blockchain.MAX_SUPPLY;
    this.session = new Session(configService.get('SESSION_SECRET_KEY'));
  }

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

  onModuleInit() {
    this.dbService.waitForIntialization().then(async () => {
      const block = await this.dbService.blockchain.getLatestBlock();
      this.handleReset(block, true);
    });
  }

  async handleReset(block?: Block, isInit?: boolean) {
    const supply = await this.dbService.blockchain.getSupply();
    const account = await this.dbService.account.findByAddress(
      Minter.rawFromAddress,
    );
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
    this.activeBlockHash = !block
      ? this.dbService.blockchain.genesisHash
      : block.blockHash;
    this.currentHeight = !block ? 0 : +block.height + 1;
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

  async handleConnection(client: WsClient) {
    try {
      const handshake = client.handshake;
      const headers = handshake.headers;
      const userAgent = headers['user-agent'];

      const isBrowser =
        /Mozilla\/5.0\s\((Macintosh|Windows|Linux|iPhone|Android).*\)/.test(
          userAgent,
        );

      if (!!headers.cookie && isBrowser) {
        const cookies = cookie.parse(headers.cookie);
        const rawAccessToken = cookies[Session.COOKIE_ACCESS_KEY];

        const accessToken = String(rawAccessToken);

        const hashedToken = AppHash.createSha256Hash(accessToken);

        // Check if token exists meaning it is invalidated
        const isInvalidated = await this.redisService.get(
          `token-${hashedToken}`,
        );

        const isValid =
          !isInvalidated &&
          (await this.session.isValidToken(String(rawAccessToken)));

        if (!isValid) {
          throw new BlockGatewayException('Not a valid token', {
            code: 403,
            shouldDisconnect: true,
          });
        }
        client.token = hashedToken;
        client.type = 'user';
        return;
      }

      const isMiner = userAgent === this.configService.get('MINER_USER_AGENT');

      if (isMiner) {
        client.type = 'miner';
        client.join(this.MINER_ROOM);
        this.sendAvailabilityNotification(false, client);
        return;
      }

      throw new BlockGatewayException('Not a valid ws connection', {
        code: 403,
        shouldDisconnect: true,
      });
    } catch (e) {
      this.filterException.catchException(client, e);
    }
  }

  async handleDisconnect(client: WsClient) {
    if (client.token) {
      await this.redisService.set(`token-${client.token}`, true, 3_600_000);
    }
  }

  @SubscribeMessage('subscribe-account')
  handleInitAccount(
    @ConnectedSocket() client: WsClient,
    @Body() dto: InitAccountDto,
  ) {
    if (client.type !== 'user') {
      throw new BlockGatewayException(
        'Only authenticated users are allowed to subscribe',
      );
    }

    client.join(`${this.ACCOUNT_ROOM_PREFIX}${dto.address.toLowerCase()}`);
  }

  @SubscribeMessage('leave-account')
  handleLeaveAccount(
    @ConnectedSocket() client: WsClient,
    @Body() dto: InitAccountDto,
  ) {
    client.leave(`${this.ACCOUNT_ROOM_PREFIX}${dto.address.toLowerCase()}`);
  }

  @SubscribeMessage('submit-block')
  async addBlockInChain(
    @Body() rawBlock: RawBlockDto,
    @ConnectedSocket() client: WsClient,
  ) {
    if (client.type !== 'miner') {
      throw new BlockGatewayException(
        'Only miners are allowed to submit blocks.',
      );
    }

    if (this.isValidatingMiner) {
      throw new ConflictException(
        'Another miner’s block is currently under validation. Please retry shortly.',
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
      const isRequestInValidBlock =
        block.blockHash !== blockHash ||
        block.merkleRoot !== merkleRoot ||
        block.transactionSize !== transactionSize ||
        transactions.length !== transactionSize;

      const isLatestBlock = this.isValidLatestBlockState(block);

      if (isRequestInValidBlock || !isLatestBlock)
        throw new Error(
          `There's something wrong with your block. Please ensure that the block is created based on the latest network state.`,
        );

      const {
        totalMinerReward,
        transactions: allTx,
        blockHash: minedBlockHash,
      } = await this.saveToDb(block, mintAddress);

      accountAddresses = this.updateMempoolState(mintAddress, block, allTx);

      await this.handleReset(block);

      client.emit('mine-success', {
        hash: minedBlockHash,
        earned: totalMinerReward.toString(),
      });
      this.server.emit('block', block.toJson(true));
    } catch (e) {
      this.sendAvailabilityNotification(false);
      this.isValidatingMiner = false;
      throw new BlockGatewayException(e.message);
    }

    if (accountAddresses) {
      const accounts =
        await this.dbService.account.findByAddress(accountAddresses);
      for (const account of accounts) {
        this.sendTo('accountInfo', account.address, account.serialize());
      }
    }

    const health = await this.getHealth();
    this.server.emit('block-health', health);
  }

  async getHealth() {
    const txSize = await this.dbService.blockchain.getTxSize();
    const currentSupply = this.currentSupply;
    return {
      totalSupply: (
        this.dbService.blockchain.MAX_SUPPLY - currentSupply
      ).toString(),
      maxSupply: this.dbService.blockchain.MAX_SUPPLY.toString(),
      txSize: txSize.toString(),
      blocks: this.currentHeight.toString(),
    };
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
    trasactions: MintOrTx[],
  ) {
    const addresses = new Set<string>([mintAddress]);

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
    return this.dbService.blockchain.getLatestBlock();
  }

  async getTargetHashFromBlock(block?: Block, isInit?: boolean) {
    const height = block?.height || 0;
    const lastHeight =
      height - (height % this.dbService.blockchain.RESET_NUMBER_OF_BLOCK);

    if (!block || (lastHeight <= 0 && isInit)) {
      return this.dbService.blockchain.calculateTargetHash([]);
    }

    if (
      !isInit &&
      (!block.height ||
        block.height % this.dbService.blockchain.RESET_NUMBER_OF_BLOCK !== 0)
    )
      return null;

    const blocks = await this.dbService.blockchain.getBlocksFromLatest();
    return this.dbService.blockchain.calculateTargetHash(blocks);
  }

  /**
   *  To validate block if it matches with the current chain state.
   */
  isValidLatestBlockState(block: Block) {
    return !(
      block.previousHash !== this.activeBlockHash ||
      block.targetHash !== this.targetHash ||
      block.height !== this.currentHeight
    );
  }

  async saveToDb(block: Block, mintAddress: string) {
    const { minerRewards, transactions } =
      await this.dbService.blockchain.saveBlock(block, mintAddress);

    return {
      blockHash: block.blockHash,
      totalMinerReward: minerRewards,
      transactions: transactions,
    };
  }
}
