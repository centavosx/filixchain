import { Level } from 'level';
import { Block } from './block';
import { BlockHeightQuery, RawBlockDb } from './types';
import { Transaction } from './transaction';
import { Minter } from './minter';
import { Account } from './account';

export type MintOrTx = Minter | Transaction;

export class Blockchain {
  static version = '1';
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
    '0x000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
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

      return encodedTransactions.map((value) => {
        if (value.length === Minter.ENCODED_SIZE) {
          return Minter.decode(value);
        }
        return Transaction.decode(value);
      }) as T extends string ? MintOrTx : MintOrTx[];
    }

    const encodedTransaction = await Blockchain._txDb.get(transactionId);
    if (encodedTransaction.length === Minter.ENCODED_SIZE) {
      return Minter.decode(encodedTransaction) as T extends string
        ? MintOrTx
        : MintOrTx[];
    }

    return Transaction.decode(encodedTransaction) as T extends string
      ? MintOrTx
      : MintOrTx[];
  }

  static async mapToBlock(rawBlockDb: RawBlockDb) {
    const transactions = await Blockchain.findTransactionsById(
      rawBlockDb.transactions,
    );
    return new Block(
      Blockchain.version,
      +rawBlockDb.height,
      transactions
        .filter((value) => value instanceof Transaction)
        .map((tx) => tx.encode()),
      rawBlockDb.targetHash,
      rawBlockDb.previousHash,
      +rawBlockDb.nonce,
      +rawBlockDb.timestamp,
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

  static async getBlocksByHeight({
    from = 0,
    to,
    reverse,
    limit,
  }: BlockHeightQuery = {}) {
    const data = await Blockchain._blockHeightIndexDb
      .values({ gte: from.toString(), lte: to?.toString(), reverse, limit })
      .all();

    const blocks: Block[] = [];

    for (const blockHash of data) {
      const rawBlock = await Blockchain._blockDb.get(blockHash);
      blocks.push(await Blockchain.mapToBlock(rawBlock));
    }

    return blocks;
  }

  static async saveBlock(blocks: Block | Block[], mintToAddress?: string) {
    const blockHeightIndexBatch = Blockchain._blockHeightIndexDb.batch();
    const blockTimestampIndexBatch = Blockchain._blockTimestampIndexDb.batch();
    const blockBatch = Blockchain._blockDb.batch();
    const txBatch = Blockchain._txDb.batch();

    const transactions: (Transaction | Minter)[] = [];

    const close = async () => {
      await Promise.all([
        txBatch.close(),
        blockBatch.close(),
        blockHeightIndexBatch.close(),
        blockTimestampIndexBatch.close(),
      ]);
    };

    let minter: Minter;

    if (mintToAddress) {
      const mintAccount = await Account.findByAddress(Minter.rawFromAddress);
      minter = new Minter({
        amount: BigInt(10000000),
        to: mintToAddress,
        nonce: mintAccount.nonce,
        version: '1',
      });
      transactions.push(minter);
      txBatch.put(minter.transactionId, minter.encode());
    }

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
          mintId: minter?.transactionId,
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
    const lastBlocks = block
      .slice(-Blockchain.RESET_NUMBER_OF_BLOCK)
      .sort((blockA, blockB) => blockA.height - blockB.height);
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
