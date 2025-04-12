'use client';

import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import { BIP32Interface } from 'bip32';
import * as tweetnacl from 'tweetnacl';
import { Crypto } from '@ph-blockchain/hash';

const bip32 = BIP32Factory(ecc);

export class SignAccount {
  private _walletAddress: string;
  private _keyPairs: tweetnacl.SignKeyPair;
  private _index: number;

  constructor(buffer: Buffer, derivationIndex: number) {
    this._index = derivationIndex;
    this._keyPairs = Crypto.getKeyPairsFromSeed(buffer);
    this._walletAddress = Crypto.generateWalletAddress(
      this._keyPairs.publicKey,
    );
  }

  get keyPairs() {
    return this._keyPairs;
  }

  get walletAddress() {
    return this._walletAddress;
  }

  get derivationIndex() {
    return this._index;
  }
}

export class Account {
  private bip32: BIP32Interface | undefined;

  constructor(private readonly data: string) {}

  static getDerivationPath(index = 0) {
    return `m/44'/0'/0'/0/${index}`;
  }

  async init() {
    if (this.bip32) return;
    const isMnemonic = bip39.validateMnemonic(this.data);
    if (isMnemonic) {
      const seed = await bip39.mnemonicToSeed(this.data);
      this.bip32 = bip32.fromSeed(seed);
      return;
    } else {
      this.bip32 = bip32.fromSeed(Buffer.from(this.data, 'hex'));
    }

    if (!this.bip32) throw new Error('Not valid mnemonic or private key');
  }

  getSignedAccount(derivationIndex = 0) {
    if (!this.bip32) {
      throw new Error('Bip32 Not initialized');
    }
    const newBip = this.bip32.derivePath(
      Account.getDerivationPath(derivationIndex),
    );

    if (!newBip?.privateKey) throw new Error('Invalid path');

    return new SignAccount(newBip.privateKey, derivationIndex);
  }
}
