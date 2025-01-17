import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transaction } from '../transaction';

describe('Block - Transaction', () => {
  const generateTransactions = () => {
    let min = 1;
    let max = 10000000000;

    return Array.from({ length: 10 }, () => {
      const value = Math.floor(Math.random() * (max - min + 1)) + min;

      const from = Crypto.generateKeyPairs();
      const to = Crypto.generateKeyPairs();

      const fromWalletAddress = Crypto.generateWalletAddress(from.publicKey);
      const toWalletAddress = Crypto.generateWalletAddress(to.publicKey);

      return {
        transaction: new Transaction({
          from: fromWalletAddress,
          to: toWalletAddress,
          amount: value,
          nonce: value,
          version: value,
        }),
        fromKeyPair: from,
        toKeyPair: to,
        fromWalletAddress,
        toWalletAddress,
        amount: value,
        nonce: value,
        version: value,
      };
    });
  };

  describe('Transaction', () => {
    it('should create a valid transaction', () => {
      const transactions = generateTransactions();
      transactions.forEach(
        ({
          transaction,
          fromWalletAddress,
          toWalletAddress,
          amount,
          nonce,
          version,
        }) => {
          expect(transaction).toBeTruthy();
          expect(transaction).toHaveProperty('from', fromWalletAddress);
          expect(transaction).toHaveProperty('to', toWalletAddress);
          expect(transaction).toHaveProperty('amount', BigInt(amount));
          expect(transaction).toHaveProperty('nonce', BigInt(nonce));
          expect(transaction).toHaveProperty('version', BigInt(version));
          expect(transaction).toHaveProperty('encode');
          expect(transaction).toHaveProperty('sign');
          const transactionId = transaction.transactionId;
          expect(transactionId).toBeTruthy();
          expect(transactionId).toMatch(/^[0-9a-fA-F]+$/);
          expect(transactionId).toHaveLength(64);
          const expectedTxId = AppHash.createSha256Hash(
            `${fromWalletAddress}${toWalletAddress}${amount}${nonce}${version}`,
          );
          expect(transactionId).toBe(expectedTxId);
        },
      );
    });

    describe('sign', () => {
      it('should be able to sign transaction correctly', () => {
        const transactions = generateTransactions();

        transactions.forEach(({ transaction, fromKeyPair }) => {
          expect(() => transaction.sign(fromKeyPair.publicKey)).toThrow();

          transaction.sign(fromKeyPair.secretKey);
          const transactionSignature = transaction.signature;
          expect(transactionSignature).toBeTruthy();
          expect(transactionSignature).toHaveProperty(
            'publicKey',
            fromKeyPair.publicKey,
          );
          expect(transactionSignature).toHaveProperty(
            'privateKey',
            fromKeyPair.secretKey,
          );
          expect(transactionSignature).toHaveProperty('signedMessage');
          expect(transactionSignature?.signedMessage).toBeTruthy();
          expect(transactionSignature?.signedMessage).toHaveLength(128);
        });
      });

      it('should be able to sign transaction correctly', () => {
        const transactions = generateTransactions();

        transactions.forEach(({ transaction, fromKeyPair }) => {
          expect(() => transaction.sign(fromKeyPair.publicKey)).toThrow();

          transaction.sign(fromKeyPair.secretKey);
          const transactionSignature = transaction.signature;
          expect(transactionSignature).toBeTruthy();
          expect(transactionSignature).toHaveProperty(
            'publicKey',
            fromKeyPair.publicKey,
          );
          expect(transactionSignature).toHaveProperty(
            'privateKey',
            fromKeyPair.secretKey,
          );
          expect(transactionSignature).toHaveProperty('signedMessage');
          expect(transactionSignature?.signedMessage).toBeTruthy();
          expect(transactionSignature?.signedMessage).toHaveLength(128);
        });
      });
    });

    describe('encode', () => {
      it('should be able to encode transaction correctly', () => {
        const transactions = generateTransactions();

        transactions.forEach(({ transaction, fromKeyPair }) => {
          transaction.sign(fromKeyPair.secretKey);
          expect(transaction.signature).toBeTruthy();
          const encodedMessage = transaction.encode();
          expect(encodedMessage).toHaveLength(464);
          expect(encodedMessage).toMatch(/^[0-9a-fA-F]+$/);
        });
      });
    });
  });

  describe('encode (static)', () => {
    it('should be able to encode transaction correctly', () => {
      const transactions = generateTransactions();

      transactions.forEach(({ transaction, fromKeyPair }) => {
        transaction.sign(fromKeyPair.secretKey);
        expect(transaction.signature).toBeTruthy();
        const encodedMessage = Transaction.encode(transaction);
        expect(encodedMessage).toHaveLength(464);
        expect(encodedMessage).toMatch(/^[0-9a-fA-F]+$/);
      });
    });
  });

  describe('decode (static)', () => {
    it('should be able to decode transaction', () => {
      const transactions = generateTransactions();

      transactions.forEach(({ transaction, fromKeyPair }) => {
        transaction.sign(fromKeyPair.secretKey);
        const encodedMessage = transaction.encode();
        const decodedTransaction = Transaction.decode(encodedMessage);
        expect(decodedTransaction).toHaveProperty('from', transaction.from);
        expect(decodedTransaction).toHaveProperty('to', transaction.to);
        expect(decodedTransaction).toHaveProperty('amount', transaction.amount);
        expect(decodedTransaction).toHaveProperty('nonce', transaction.nonce);
        expect(decodedTransaction).toHaveProperty(
          'version',
          transaction.version,
        );
        expect(decodedTransaction).toHaveProperty(
          'transactionId',
          transaction.transactionId,
        );
      });
    });
  });
});
