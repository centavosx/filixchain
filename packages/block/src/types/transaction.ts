import { KeyPairs } from './keypairs';

export type TransactionSignature = Partial<
  KeyPairs & {
    signedMessage: string;
  }
>;

export type RawTransaction = {
  from: string;
  to: string;
  amount: bigint | string | number;
  nonce: bigint | string | number;
  version: bigint | string | number;
  signature?: TransactionSignature;
  timestamp?: bigint | string | number;
  blockHeight?: bigint | string | number;
};
