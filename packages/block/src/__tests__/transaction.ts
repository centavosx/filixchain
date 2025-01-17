import { Crypto } from '@ph-blockchain/hash';
import * as randomstring from 'randomstring';
import { Transaction } from '../transaction';

describe('Block - Transaction', () => {
  const createRandomTransaction = () => {
    const randomFrom = Crypto.generateKeyPairs();
    const randomTo = Crypto.generateKeyPairs();
    return;
  };
  it('should be able to create and sign transactions', () => {
    const keyPairs = Array.from(
      {
        length: 5,
      },
      () => [Crypto.generateKeyPairs(), Crypto.generateKeyPairs()],
    );

    keyPairs.forEach(([from, to]) => {
      const fromWalletAddress = Crypto.generateWalletAddress(from.publicKey);
      const toWalletAddress = Crypto.generateWalletAddress(to.publicKey);

      const transaction = new Transaction({
        from: fromWalletAddress,
        to: toWalletAddress,
        amount: '1023230',
        nonce: '123',
        version: '112323',
      });

      const encodedMessage = transaction
        .sign(Buffer.from(from.secretKey))
        .encode();
    });
  });

  describe('encode', () => {
    it('should encode the transaction using the staic method', () => {
      Transaction;
    });
  });
});
