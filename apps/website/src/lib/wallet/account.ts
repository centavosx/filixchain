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
    this._keyPairs = Crypto.getKeyPairs(buffer);
    this._walletAddress = Crypto.generateWalletAddress(
      this._keyPairs.publicKey,
    );
  }

  get keyPairs() {
    return this._walletAddress;
  }

  get walletAddress() {
    return this._walletAddress;
  }

  get derivationIndex() {
    return this._index;
  }
}

export class Account {
  private node: BIP32Interface;

  constructor(data: string) {
    const isMnemonic = bip39.validateMnemonic(data);
    if (isMnemonic) {
      const seed = bip39.mnemonicToSeedSync(data);
      this.node = bip32.fromSeed(seed);
      return;
    } else {
      this.node = bip32.fromSeed(Buffer.from(data, 'hex'));
    }

    if (!this.node) throw new Error('Not valid mnemonic or private key');
  }

  static getDerivationPath(index = 0) {
    return `m/44'/0'/0'/0/${index}`;
  }

  getSignedAccount(derivationIndex: number) {
    const newNode = this.node.derivePath(
      Account.getDerivationPath(derivationIndex),
    );

    if (!newNode?.privateKey) throw new Error('Invalid path');

    return new SignAccount(newNode.privateKey, derivationIndex);
  }
}
