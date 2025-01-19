import { Block } from './block';
import { RawBlock } from './types';

export class Blockchain {
  private activeBlockHash: string;
  private chains: Block[] = [];
  private currentTargetHash: string;
  private currentHeight: number;

  static readonly MAX_TARGET = BigInt(
    '0x0000fffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );

  static readonly genesisHash =
    '0000000000000000000000000000000000000000000000000000000000000000';

  // Block should reset in 200 height
  static readonly RESET_NUMBER_OF_BLOCK = 200;
  // 1 minute block creation time
  static readonly BLOCK_MINE_TIME = 60 * 1000;

  /**
   *  Need to recalculate target hash to  dynamically adjust the hash if it becomes too slow or too fast.
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

  /**
   *  To validate block if it matches with the current chain state.
   */
  private validateBlockState(block: Block) {
    if (block.previousHash !== this.activeBlockHash)
      throw new Error('Previous hash is not valid');

    if (block.targetHash !== this.currentTargetHash)
      throw new Error('Block contains invalid target hash');

    if (block.height !== this.currentHeight)
      throw new Error('Block is not synced to the latest height');

    // If block time is two minutes ahead or behind the current time then it is not a valid block
    if (Math.abs(block.timestamp - Date.now()) > 120000) {
      throw new Error('Block is one minute ahead or behind the current time');
    }
    try {
      const transactions = block.decodeTransactions();
      //   transactions.forEach((value) => {
      // TODO: Validate each transaction and check if the address has a valid spent amount
      //   });
    } catch {
      throw new Error('Block contains invalid transactions');
    }
  }

  addBlockInChain(rawBlock: RawBlock) {
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
    this.chains.push(block);
    this.currentHeight++;

    if (this.currentHeight % Blockchain.RESET_NUMBER_OF_BLOCK === 0) {
      this.currentTargetHash = Blockchain.calculateTargetHash(this.chains);
    }
  }
}
