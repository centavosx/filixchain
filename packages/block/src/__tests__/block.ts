import { Crypto } from '@ph-blockchain/hash';
import { Transaction } from '../transaction';
import { Block } from '../block';

const RESET_NUMBER_OF_BLOCK = 10;
const BLOCK_MINE_MILLISECONDS = 1000;
const MAX_TARGET = BigInt(
  '0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
);

describe('Block - Block', () => {
  const generateTransactions = () => {
    let min = 1;
    let max = 10000000000;

    return Array.from({ length: 10 }, () => {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;

      const from = Crypto.generateKeyPairs();
      const to = Crypto.generateKeyPairs();

      const fromWalletAddress = Crypto.generateWalletAddress(from.publicKey);
      const toWalletAddress = Crypto.generateWalletAddress(to.publicKey);

      const encodedTransaction = new Transaction({
        from: fromWalletAddress,
        to: toWalletAddress,
        amount: value,
        nonce: 0,
        version: 1,
      })
        .sign(from.secretKey)
        .encode();

      return encodedTransaction;
    });
  };

  const calculateTargetHash = (block: Block[]) => {
    const lastBlocks = block.slice(-RESET_NUMBER_OF_BLOCK);
    const firstBlock = lastBlocks[0];
    const lastBlock = lastBlocks[lastBlocks.length - 1];
    const lastTimestamp = lastBlock?.timestamp ?? Date.now();
    const firstTimestamp = firstBlock?.timestamp ?? Date.now();
    const timeTaken =
      (lastTimestamp - firstTimestamp) /
      (RESET_NUMBER_OF_BLOCK * BLOCK_MINE_MILLISECONDS);

    const currentTargetHashInBigInt = lastBlock?.targetHash
      ? BigInt(`0x${lastBlock?.targetHash}`)
      : BigInt(
          `0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF`,
        );

    const newDifficulty = BigInt(
      Math.round(Number(currentTargetHashInBigInt) * (timeTaken || 1)),
    );

    if (newDifficulty > MAX_TARGET) {
      return MAX_TARGET.toString(16);
    }

    return newDifficulty.toString(16);
  };

  describe('Block', () => {
    const blockchain: Block[] = [];
    let targetHash = calculateTargetHash(blockchain);

    it('should create a genesis block', async () => {
      const transactions = generateTransactions();
      const version = '0';
      const height = blockchain.length;
      const timestamp = Date.now();

      const block = new Block(
        version,
        height,
        transactions,
        targetHash,
        undefined,
        undefined,
        timestamp,
      );

      expect(block).toHaveProperty('version', version);
      expect(block).toHaveProperty('height', height);
      expect(block).toHaveProperty('targetHash', targetHash);
      expect(block).toHaveProperty('transactions', new Set(transactions));
      expect(block).toHaveProperty('timestamp', timestamp);
      expect(block).toHaveProperty('previousHash');
      expect(block.blockHash).toBeTruthy();
      expect(block.blockHash).toHaveLength(64);
      expect(block.blockHash).toMatch(/^[0-9a-fA-F]+$/);
      expect(typeof block.nonce).toBe('number');
      expect(typeof block.transactionSize).toBe('number');
      expect(block.merkleRoot).toBeTruthy();
      expect(block.merkleRoot).toHaveLength(64);
      expect(block.merkleRoot).toMatch(/^[0-9a-fA-F]+$/);
      blockchain.push(await block.mine());
    }, 10000000);

    it('should create blocks chained together', async () => {
      const transactions = generateTransactions();
      const version = '0';

      for (const _ of Array(RESET_NUMBER_OF_BLOCK).fill(null)) {
        const height = blockchain.length;
        const timestamp = Date.now();

        const block = new Block(
          version,
          height,
          transactions,
          targetHash,
          blockchain[height - 1].blockHash,
          undefined,
          timestamp,
        );
        blockchain.push(await block.mine());
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
          }, BLOCK_MINE_MILLISECONDS),
        );
      }

      targetHash = calculateTargetHash(blockchain);
    }, 10000000);

    it('should decode block transactions', async () => {
      const transactions = generateTransactions();
      const version = '0';

      for (const _ of Array(RESET_NUMBER_OF_BLOCK).fill(null)) {
        const height = blockchain.length;
        const timestamp = Date.now();

        const block = new Block(
          version,
          height,
          transactions,
          targetHash,
          blockchain[height - 1].blockHash,
          undefined,
          timestamp,
        );
        blockchain.push(await block.mine());
        const decodedTransactions = block.decodeTransactions();

        decodedTransactions.forEach((value) =>
          expect(value.decoded).toBeInstanceOf(Transaction),
        );

        await new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
          }, BLOCK_MINE_MILLISECONDS),
        );
      }

      targetHash = calculateTargetHash(blockchain);
    }, 10000000);

    describe('toJson', () =>
      it('should generate json object', async () => {
        const transactions = generateTransactions();
        const version = '0';

        for (const _ of Array(RESET_NUMBER_OF_BLOCK).fill(null)) {
          const height = blockchain.length;
          const timestamp = Date.now();

          const block = new Block(
            version,
            height,
            transactions,
            targetHash,
            blockchain[height - 1].blockHash,
            undefined,
            timestamp,
          );
          blockchain.push(await block.mine());
          const blockInJson = block.toJson();

          expect(blockInJson).toHaveProperty('version', block.version);
          expect(blockInJson).toHaveProperty('height', block.height);
          expect(blockInJson).toHaveProperty('timestamp', block.timestamp);
          expect(blockInJson).toHaveProperty(
            'transactions',
            Array.from(block.transactions.values()),
          );
          expect(blockInJson).toHaveProperty(
            'previousHash',
            block.previousHash,
          );
          expect(blockInJson).toHaveProperty('targetHash', block.targetHash);
          expect(blockInJson).toHaveProperty('blockHash', block.blockHash);
          expect(blockInJson).toHaveProperty('nonce', block.nonce);
          expect(blockInJson).toHaveProperty('merkleRoot', block.merkleRoot);
          expect(blockInJson).toHaveProperty(
            'transactionSize',
            block.transactionSize,
          );
        }

        targetHash = calculateTargetHash(blockchain);
      }, 10000000));
  });
});
