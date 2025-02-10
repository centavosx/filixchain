import { Block, MintOrTxSerialize, RawBlock } from '@ph-blockchain/block';
import { create } from 'zustand';

export type UseNewBlock = {
  block?: RawBlock;
  transactions: MintOrTxSerialize[];
  setNewBlock: (value: RawBlock) => void;
};

export const useNewBlock = create<UseNewBlock>((set) => ({
  block: undefined,
  transactions: [],
  setNewBlock: (rawBlock) => {
    const block = new Block(
      rawBlock.version,
      rawBlock.height,
      rawBlock.transactions || [],
      rawBlock.targetHash,
      rawBlock.previousHash,
      rawBlock.nonce,
      rawBlock.timestamp,
    );
    set({
      block: block.toJson(false),
      transactions: block
        .decodeTransactions()
        .map((value) => value.decoded.serialize()),
    });
  },
}));
