import { Level } from 'level';

import { Crypto } from '@ph-blockchain/hash';
import { Block, Minter, Transaction } from '@ph-blockchain/block';
import { BlockHeightQuery, RawBlockDb } from '../dto/block';

export type MintOrTx = Minter | Transaction;

export class Blockchain {
  static SUPPLY_KEY = 'SUPPLY';
  static MAX_SUPPLY = Transaction.TX_CONVERSION_UNIT ** BigInt(2);
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

  static readonly genesisHash = Block.genesisHash;

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

  static async findTransactionsById<
    T extends string | Array<string>,
    E extends boolean = false,
  >(transactionId: T, isEncoded?: E) {
    const isArray = Array.isArray(transactionId);
    const encodedTransactions = isArray
      ? await Blockchain._txDb.getMany(transactionId)
      : [await Blockchain._txDb.get(transactionId)];

    const data = encodedTransactions.map((value) => {
      if (value.length === Minter.ENCODED_SIZE) {
        return isEncoded ? value : Minter.decode(value);
      }
      return isEncoded ? value : Transaction.decode(value);
    });
    return (isArray ? data : data?.[0]) as T extends string
      ? E extends true
        ? string
        : MintOrTx
      : E extends true
        ? string[]
        : MintOrTx[];
  }

  static async getSupply() {
    let supply = await Blockchain._db.get(Blockchain.SUPPLY_KEY);
    if (!supply) {
      supply = Crypto.encodeIntTo8BytesString(Blockchain.MAX_SUPPLY);
      await Blockchain._db.put(Blockchain.SUPPLY_KEY, supply);
    }

    return Crypto.decode8BytesStringtoBigInt(supply);
  }

  static async mapToBlock(rawBlockDb: RawBlockDb) {
    const transactions = await Blockchain.findTransactionsById(
      rawBlockDb.transactions,
      true,
    );
    return new Block(
      Blockchain.version,
      +rawBlockDb.height,
      transactions,
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

  static async saveBlock(
    blocks: Block | Block[],
    onTx?: (decoded: Transaction | Minter, encoded: string) => Promise<void>,
  ) {
    const blockHeightIndexBatch = Blockchain._blockHeightIndexDb.batch();
    const blockTimestampIndexBatch = Blockchain._blockTimestampIndexDb.batch();
    const blockBatch = Blockchain._blockDb.batch();
    const txBatch = Blockchain._txDb.batch();
    let supply = await Blockchain.getSupply();

    const transactions: (Transaction | Minter)[] = [];

    const close = async () => {
      await Promise.all([
        txBatch.close(),
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

          if (decoded instanceof Minter) supply -= decoded.amount;
          txIds.push(txId);
          await onTx(decoded, encoded);
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
            Blockchain._db.put(
              Blockchain.SUPPLY_KEY,
              Crypto.encodeIntTo8BytesString(supply),
            ),
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
   *  Need to recalculate target hash to dynamically adjust the hash if solving the problem becomes too slow or too fast.
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
