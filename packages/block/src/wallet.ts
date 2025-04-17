import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import type { BIP32Interface } from 'bip32';
import * as tweetnacl from 'tweetnacl';
import { Crypto } from '@ph-blockchain/hash';

const bip32 = BIP32Factory(ecc);

export class SignAccount {
  private _walletAddress: string;
  private _keyPairs: tweetnacl.SignKeyPair;
  private _index: number;

  constructor(buffer: Uint8Array, derivationIndex: number) {
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

export class WalletAccount {
  private bip32: BIP32Interface | undefined;
  private _isMnemonic: boolean | undefined;

  constructor(private readonly data: string) {
    console.log(data);
  }

  static getDerivationPath(index = 0) {
    return `m/44'/0'/0'/0/${index}`;
  }

  get mnemonicOrKey() {
    return this.data;
  }

  get isMnemonic() {
    return Boolean(this._isMnemonic);
  }

  async init() {
    if (this.bip32) return;
    this._isMnemonic = bip39.validateMnemonic(this.data);
    if (this._isMnemonic) {
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
      WalletAccount.getDerivationPath(derivationIndex),
    );

    if (!newBip?.privateKey) throw new Error('Invalid path');

    return new SignAccount(newBip.privateKey, derivationIndex);
  }
}
