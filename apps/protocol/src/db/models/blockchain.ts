import { Level } from 'level';

import { Crypto } from '@ph-blockchain/hash';
import {
  Block,
  Minter,
  MintOrTx,
  MintOrTxSerialize,
  RawBlock,
  Transaction,
} from '@ph-blockchain/block';
import {
  BlockHeightQuery,
  BlockTransactionQuery,
  RawBlockDb,
} from '../../dto/block.dto';
import { Account } from './account';

export class Blockchain {
  static SUPPLY_KEY = 'SUPPLY';
  static SIZE_KEY = 'SIZE';
  static MAX_SUPPLY = Transaction.TX_CONVERSION_UNIT ** BigInt(2);

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

  static async mapToBlock(rawBlockDb: RawBlockDb) {
    const transactions = await Blockchain.findTransactionsById(
      rawBlockDb.transactions,
      true,
    );
    return new Block(
      Block.version,
      +rawBlockDb.height,
      transactions,
      rawBlockDb.targetHash,
      rawBlockDb.previousHash,
      +rawBlockDb.nonce,
      +rawBlockDb.timestamp,
    );
  }

  static async findTransactionBlock<T extends string | Array<string>>(
    transactionId: T,
  ) {
    const isArray = Array.isArray(transactionId);
    const txBlock = Blockchain._txDb.sublevel('blockIndex');
    await txBlock.open();

    const blockHashes = isArray
      ? await txBlock.getMany(transactionId)
      : [await txBlock.get(transactionId)];

    return (isArray ? blockHashes : blockHashes?.[0]) as T extends string
      ? string
      : string[];
  }

  static async findBlockByHash<T extends string | Array<string>>(hash: T) {
    const isArray = Array.isArray(hash);
    const rawBlocks = isArray
      ? await Blockchain._blockDb.getMany(hash)
      : [await Blockchain._blockDb.get(hash)];
    const blocks: Block[] = [];
    for (const rawBlock of rawBlocks) {
      blocks.push(await Blockchain.mapToBlock(rawBlock));
    }

    if (!blocks.length) throw new Error('Block hash not found');

    return (isArray ? blocks : blocks?.[0]) as T extends string
      ? Block
      : Block[];
  }

  static async findTransactionsById<
    T extends string | Array<string>,
    E extends boolean = false,
  >(transactionId: T, isEncoded?: E, includeBlock?: boolean) {
    const isArray = Array.isArray(transactionId);
    const transactionIds: Array<string> = isArray
      ? transactionId
      : [transactionId];
    const encodedTransactions = await Blockchain._txDb.getMany(transactionIds);
    const blockMap: Record<string, Block> = {};
    const txBlockMap: Record<string, Block> = {};
    const data: (string | Transaction | Minter)[] = [];

    if (!isEncoded && includeBlock) {
      for (const txId of transactionIds) {
        const blockHash = await Blockchain.findTransactionBlock(txId);
        let block = blockMap[blockHash];
        if (!block) {
          block = await Blockchain.findBlockByHash(blockHash);
          blockMap[blockHash] = block;
        }
        txBlockMap[txId] = block;
      }
    }

    for (const encoded of encodedTransactions) {
      if (!isEncoded) {
        const mintOrTx =
          encoded.length === Minter.ENCODED_SIZE
            ? Minter.decode(encoded)
            : Transaction.decode(encoded);

        if (includeBlock) {
          const block = txBlockMap[mintOrTx.transactionId];
          if (!block) continue;

          mintOrTx.addBlock(block);
        }

        data.push(mintOrTx);
        continue;
      }

      data.push(encoded);
    }

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

  static async getTxSize() {
    const size = await Blockchain._txDb.get(Blockchain.SIZE_KEY);

    if (!size) {
      return BigInt(0);
    }

    return Crypto.decode8BytesStringtoBigInt(size);
  }

  static async getBlocksFromLatest(limit = Blockchain.RESET_NUMBER_OF_BLOCK) {
    const data = await Blockchain._blockTimestampIndexDb
      .values({ lte: `${Date.now()}`, reverse: true, limit: limit })
      .all();

    const blocks: Block[] = [];

    for (const blockHash of data) {
      const rawBlock = await Blockchain._blockDb.get(blockHash);
      const block = await Blockchain.mapToBlock(rawBlock);
      blocks.push(block);
    }

    return blocks;
  }

  static async getLatestBlock() {
    const blocks = await this.getBlocksFromLatest(1);
    return blocks?.[0];
  }

  static async getBlockByHeight(height: number) {
    const blockHash = await Blockchain._blockHeightIndexDb.get(
      Crypto.encodeIntTo8BytesString(height),
    );

    if (!blockHash) throw new Error('Block height not found');

    const block = await Blockchain.findBlockByHash(blockHash);

    return block;
  }

  static async getBlocksByHeight({
    start = 0,
    end,
    reverse,
    limit,
    includeTx = false,
  }: BlockHeightQuery = {}) {
    const data = await Blockchain._blockHeightIndexDb
      .values({
        gte: Crypto.encodeIntTo8BytesString(start),
        lte: end ? Crypto.encodeIntTo8BytesString(end) : undefined,
        reverse,
        limit,
      })
      .all();

    const blocks: RawBlock[] = [];

    for (const blockHash of data) {
      const rawBlock = await Blockchain._blockDb.get(blockHash);
      const block = await Blockchain.mapToBlock(rawBlock);

      blocks.push(block.toJson(includeTx));
    }

    return blocks;
  }

  static async getTransactions({
    reverse,
    limit = 20,
    lastBlockHeight,
    nextTxIndex = 0,
  }: BlockTransactionQuery) {
    const transactions: MintOrTxSerialize[] = [];
    let count = 0;
    let txIndex = nextTxIndex;
    let iteratorData: [string, string];

    const lastBlockHeightInHex =
      lastBlockHeight !== undefined
        ? Crypto.encodeIntTo8BytesString(lastBlockHeight)
        : undefined;

    for await (iteratorData of Blockchain._blockHeightIndexDb.iterator({
      reverse,
      ...(reverse
        ? { lte: lastBlockHeightInHex }
        : { gte: lastBlockHeightInHex }),
    })) {
      const [_, blockHash] = iteratorData;
      const rawBlock = await Blockchain._blockDb.get(blockHash);
      const block = await Blockchain.mapToBlock(rawBlock);
      const txs = block.decodeTransactions().slice(txIndex);

      for (const tx of txs) {
        if (count === limit) break;
        const { decoded } = tx;
        transactions.push(decoded.serialize());
        count++;
        txIndex++;
      }

      if (count === limit) break;

      txIndex = 0;
    }

    return {
      transactions,
      ...(transactions.length && {
        nextTxIndex: txIndex.toString(),
        lastHeight: iteratorData
          ? Crypto.decode8BytesStringtoBigInt(iteratorData[0]).toString()
          : undefined,
      }),
    };
  }

  static async saveBlock(blocks: Block | Block[], mintAddress: string) {
    const mintAccount = await Account.findByAddress(mintAddress);

    await mintAccount.initDb();
    mintAccount.startBatch();

    const mappedAccount = new Map<string, Account>([
      [mintAccount.address, mintAccount],
    ]);

    let txSize = await Blockchain.getTxSize();
    let supply = await Blockchain.getSupply();

    const originalSupply = supply;
    const originalTxSize = txSize;
    const blockHeightIndexBatch = Blockchain._blockHeightIndexDb.batch();
    const blockTimestampIndexBatch = Blockchain._blockTimestampIndexDb.batch();
    const blockBatch = Blockchain._blockDb.batch();
    const txBatch = Blockchain._txDb.batch();
    const txBlock = Blockchain._txDb.sublevel('blockIndex');
    await txBlock.open();
    const txBlockBatch = txBlock.batch();

    let isRewardIncluded = false;

    const transactions: (Transaction | Minter)[] = [];

    const getAccounts = () => {
      return [...mappedAccount.values()];
    };

    const close = async () => {
      const indexClose = async () => {
        await txBlockBatch.close();
        await txBlock.close();
      };
      await Promise.all([
        txBatch.close(),
        indexClose(),
        Blockchain._txDb.put(
          Blockchain.SIZE_KEY,
          Crypto.encodeIntTo8BytesString(originalTxSize),
        ),
        blockBatch.close(),
        Blockchain._db.put(
          Blockchain.SUPPLY_KEY,
          Crypto.encodeIntTo8BytesString(originalSupply),
        ),
        blockHeightIndexBatch.close(),
        blockTimestampIndexBatch.close(),
        ...getAccounts().map((value) => value.rejectAndClose()),
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

          const rawFromAddress = decoded.rawFromAddress;
          const rawToAddress = decoded.rawToAddress;

          let fromAccount = mappedAccount.get(rawFromAddress);
          let toAccount = mappedAccount.get(rawToAddress);

          if (!fromAccount) {
            fromAccount = await Account.findByAddress(rawFromAddress);
            await fromAccount.initDb();
            fromAccount.startBatch();
            mappedAccount.set(rawFromAddress, fromAccount);
          }

          if (!toAccount) {
            toAccount = await Account.findByAddress(rawToAddress);
            await toAccount.initDb();
            toAccount.startBatch();
            mappedAccount.set(rawToAddress, toAccount);
          }

          fromAccount.addTransaction(decoded);
          toAccount.receiveTransaction(decoded);
          txBatch.put(txId, encoded);
          txBlockBatch.put(txId, blockHash);
          transactions.push(decoded);
          txIds.push(txId);
          txSize++;

          if (decoded instanceof Transaction) {
            mintAccount.addTotalFee(Transaction.FIXED_FEE);
            continue;
          }

          if (!(decoded instanceof Minter)) continue;

          if (isRewardIncluded)
            throw new Error("You can't include multiple mint reward");

          if (supply === BigInt(0)) {
            throw new Error("Can't mint, there's no supply left");
          }

          supply -= decoded.amount;
          isRewardIncluded = true;
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
        blockHeightIndexBatch.put(
          Crypto.encodeIntTo8BytesString(block.height),
          blockHash,
        );
        blockTimestampIndexBatch.put(
          Crypto.encodeIntTo8BytesString(block.timestamp),
          blockHash,
        );
      }

      const indexWriteAndClose = async () => {
        await txBlockBatch.write();
        await txBlock.close();
      };

      await Promise.all([
        txBatch.write(),
        indexWriteAndClose(),
        Blockchain._txDb.put(
          Blockchain.SIZE_KEY,
          Crypto.encodeIntTo8BytesString(txSize),
        ),
        blockBatch.write(),
        Blockchain._db.put(
          Blockchain.SUPPLY_KEY,
          Crypto.encodeIntTo8BytesString(supply),
        ),
        blockHeightIndexBatch.write(),
        blockTimestampIndexBatch.write(),
        ...getAccounts().map((value) => value.writeBatchAndSaveAccount()),
      ]);

      const totalTxFee = transactions.reduce((accumulator, value) => {
        if (value instanceof Minter) return accumulator + Minter.FIX_MINT;
        return accumulator + Transaction.FIXED_FEE;
      }, BigInt(0));

      return { minerRewards: totalTxFee, transactions };
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
