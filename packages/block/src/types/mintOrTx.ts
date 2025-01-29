import { Minter } from '../minter';
import { Transaction } from '../transaction';

export type MintOrTx = Minter | Transaction;

export type MintOrTxSerialize = ReturnType<MintOrTx['serialize']>;
