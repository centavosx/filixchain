import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transaction } from '../transaction';
import { Block } from '../block';

const MAX_DIFFICULTY =
  '0x000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

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
        nonce: value,
        version: value,
      })
        .sign(from.secretKey)
        .encode();

      return encodedTransaction;
    });
  };

  const calculateTargetDifficulty = (block: Block[]) => {
    const resetNumber = 10;
    const blockMineTime = 10;
    const lastBlocks = block.slice(-10);
    const firstBlock = lastBlocks[0];
    const lastBlock = lastBlocks[lastBlocks.length - 1];
    const lastTimestamp = lastBlock?.timestamp ?? Date.now();
    const firstTimestamp = firstBlock?.timestamp ?? Date.now();
    const timeTaken = Math.round(
      (lastTimestamp - firstTimestamp) / (resetNumber * blockMineTime),
    );

    const newDifficulty =
      (firstBlock?.targetDifficulty ?? 0x1) * (timeTaken || 1);

    if (newDifficulty > +MAX_DIFFICULTY) {
      return +MAX_DIFFICULTY;
    }

    return newDifficulty;
  };

  describe('Block', () => {
    const blockchain: Block[] = [];
    let targetDifficulty = calculateTargetDifficulty(blockchain);

    it('should create a genesis block', () => {
      const transactions = generateTransactions();
      const version = '0';
      const height = blockchain.length;
      const timestamp = Date.now();

      const block = new Block(
        version,
        height,
        timestamp,
        transactions,
        targetDifficulty,
      );

      expect(block).toHaveProperty('version', version);
      expect(block).toHaveProperty('height', height);
      expect(block).toHaveProperty('targetDifficulty', targetDifficulty);
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

      blockchain.push(block.mine());
    });

    it('should create a blocks', async () => {
      const transactions = generateTransactions();
      const version = '0';

      for (const _ of Array(3).fill(null)) {
        const height = blockchain.length;
        const timestamp = Date.now();

        const block = new Block(
          version,
          height,
          timestamp,
          transactions,
          targetDifficulty,
          blockchain[height - 1].blockHash,
        );
        blockchain.push(block.mine());
        console.log(block);
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            resolve();
          }, 1000),
        );
      }
      targetDifficulty = calculateTargetDifficulty(blockchain);
      console.log(targetDifficulty);
    }, 600000000);
  });
});
