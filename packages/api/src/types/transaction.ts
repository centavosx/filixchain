import { Transaction } from '@ph-blockchain/block';

export type SerializedTransaction = ReturnType<Transaction['serialize']>;
