import { Level } from 'level';
import { Block } from './block';
import { RawBlockDb } from './types';
import { Transaction } from './transaction';

export class Blockchain {
  private static version = '1';
  private static _isOpen = false;
  private static _db: Level<string, string>;
  private static _txDb: ReturnType<typeof this.intializeTx>;
  private static _blockDb: ReturnType<typeof this.intializeBlock>;
  private static _blockHeightIndexDb: ReturnType<
    typeof this.intializeBlockHeightIndexDb
  >;
  private static _blockTimestampIndexDb: ReturnType<
    typeof this.intializeBlockTimestampIndexDb
  >;

  static readonly MAX_TARGET = BigInt(
    '0x0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );

  static readonly genesisHash =
    '0000000000000000000000000000000000000000000000000000000000000000';

  // Block should reset in 200 height
  static readonly RESET_NUMBER_OF_BLOCK = 200;
  // 1 minute block creation time
  static readonly BLOCK_MINE_TIME = 60 * 1000;

  private static intializeTx() {
    return Blockchain._db.sublevel<string, string>('transactions', {});
  }

  private static intializeBlock() {
    return Blockchain._db.sublevel<string, RawBlockDb>('block', {
      valueEncoding: 'json',
    });
  }

  private static intializeBlockHeightIndexDb() {
    return Blockchain._blockDb.sublevel<string, string>('heightIndex', {});
  }

  private static intializeBlockTimestampIndexDb() {
    return Blockchain._blockDb.sublevel<string, string>('timestampIndex', {});
  }

  public static async initialize() {
    if (Blockchain._isOpen) return;
    Blockchain._db = new Level('./database/blockchain', {
      valueEncoding: 'json',
    });
    await Blockchain._db.open();
    Blockchain._txDb = this.intializeTx();
    await Blockchain._txDb.open();
    Blockchain._blockDb = this.intializeBlock();
    await Blockchain._blockDb.open();
    Blockchain._blockHeightIndexDb = this.intializeBlockHeightIndexDb();
    await Blockchain._blockHeightIndexDb.open();
    Blockchain._blockTimestampIndexDb = this.intializeBlockTimestampIndexDb();
    await Blockchain._blockTimestampIndexDb.open();
    Blockchain._isOpen = true;
  }

  static async findTransactionsById<T extends string | Array<string>>(
    transactionId: T,
  ) {
    if (Array.isArray(transactionId)) {
      const encodedTransactions = await Blockchain._txDb.getMany(transactionId);

      return encodedTransactions.map(Transaction.decode) as T extends string
        ? Transaction
        : Transaction[];
    }

    const encodedTransaction = await Blockchain._txDb.get(transactionId);

    return Transaction.decode(encodedTransaction) as T extends string
      ? Transaction
      : Transaction[];
  }

  static async mapToBlock(rawBlockDb: RawBlockDb) {
    const transactions = await Blockchain.findTransactionsById(
      rawBlockDb.transactions,
    );
    return new Block(
      Blockchain.version,
      +rawBlockDb.height,
      +rawBlockDb.timestamp,
      transactions.map((tx) => tx.encode()),
      rawBlockDb.targetHash,
      rawBlockDb.previousHash,
      +rawBlockDb.nonce,
    );
  }

  static async getBlocksFromLatest(limit = Blockchain.RESET_NUMBER_OF_BLOCK) {
    const data = await Blockchain._blockTimestampIndexDb
      .values({ lte: `${Date.now()}`, reverse: true, limit: limit })
      .all();

    const blocks: Block[] = [];

    for (const blockHash of data) {
      const rawBlock = await Blockchain._blockDb.get(blockHash);
      blocks.push(await Blockchain.mapToBlock(rawBlock));
    }

    return blocks;
  }

  static async getLatestBlock() {
    const blocks = await this.getBlocksFromLatest(1);
    return blocks?.[0];
  }

  static async getBlockByHeight() {
    const data = await Blockchain._blockTimestampIndexDb
      .values({ lte: `${Date.now()}`, reverse: true, limit: 1 })
      .all();
    const blockHash = data?.[0];
    const rawBlock = blockHash
      ? await Blockchain._blockDb.get(blockHash)
      : undefined;

    return rawBlock ? await Blockchain.mapToBlock(rawBlock) : undefined;
  }

  static async saveBlock(blocks: Block | Block[]) {
    const blockHeightIndexBatch = Blockchain._blockHeightIndexDb.batch();
    const blockTimestampIndexBatch = Blockchain._blockTimestampIndexDb.batch();
    const blockBatch = Blockchain._blockDb.batch();
    const txBatch = Blockchain._txDb.batch();

    const transactions: Transaction[] = [];

    const close = async () => {
      await Promise.all([
        txBatch.close(),
        blockBatch.close(),
        blockBatch.close(),
        blockHeightIndexBatch.close(),
        blockTimestampIndexBatch.close(),
      ]);
    };

    try {
      for (const block of Array.isArray(blocks) ? blocks : [blocks]) {
        const blockHash = block.blockHash;
        const decodedTransactions = block.decodeTransactions();
        const txIds: string[] = [];
        for (const transaction of decodedTransactions) {
          const { decoded, encoded } = transaction;
          const txId = decoded.transactionId;
          txBatch.put(txId, encoded);
          transactions.push(decoded);
          txIds.push(txId);
        }

        blockBatch.put(blockHash, {
          version: block.version,
          nonce: BigInt(block.nonce).toString(),
          height: BigInt(block.height).toString(),
          timestamp: BigInt(block.timestamp).toString(),
          transactionSize: block.transactionSize,
          transactions: txIds,
          previousHash: block.previousHash,
          targetHash: block.targetHash,
          blockHash: block.blockHash,
          merkleRoot: block.merkleRoot,
        });
        blockHeightIndexBatch.put(BigInt(block.height).toString(), blockHash);
        blockTimestampIndexBatch.put(
          BigInt(block.timestamp).toString(),
          blockHash,
        );
      }

      return {
        transactions,
        close,
        write: async () => {
          await Promise.all([
            txBatch.write(),
            blockBatch.write(),
            blockBatch.write(),
            blockHeightIndexBatch.write(),
            blockTimestampIndexBatch.write(),
          ]);
        },
      };
    } catch (e) {
      await close();
      throw e;
    }
  }

  /**
   *  Need to recalculate target hash to dynamically adjust the hash if it solving the problem becomes too slow or too fast.
   */
  static calculateTargetHash = (block: Block[]) => {
    const lastBlocks = block.slice(-Blockchain.RESET_NUMBER_OF_BLOCK);
    const firstBlock = lastBlocks[0];
    const lastBlock = lastBlocks[lastBlocks.length - 1];
    const lastTimestamp = lastBlock?.timestamp ?? Date.now();
    const firstTimestamp = firstBlock?.timestamp ?? Date.now();
    const timeTaken =
      (lastTimestamp - firstTimestamp) /
      (Blockchain.RESET_NUMBER_OF_BLOCK * Blockchain.BLOCK_MINE_TIME);

    const currentTargetHashInBigInt = lastBlock?.targetHash
      ? BigInt(`0x${lastBlock?.targetHash}`)
      : Blockchain.MAX_TARGET;

    const newDifficulty = BigInt(
      Math.round(Number(currentTargetHashInBigInt) * (timeTaken || 1)),
    );

    if (newDifficulty > Blockchain.MAX_TARGET) {
      return Blockchain.MAX_TARGET.toString(16);
    }

    return newDifficulty.toString(16);
  };
}
