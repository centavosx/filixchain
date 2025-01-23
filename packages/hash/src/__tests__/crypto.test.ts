import { Crypto } from '../crypto';
import * as randomstring from 'randomstring';
import * as nacl from 'tweetnacl';

describe('Hash - Crypto', () => {
  const checkForValidKeyPairs = (keyPair: any) => {
    expect(keyPair).toBeTruthy();
    expect(keyPair).toHaveProperty('publicKey');
    expect(keyPair).toHaveProperty('secretKey');
    expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.secretKey).toBeInstanceOf(Uint8Array);
    expect(keyPair.publicKey).toHaveLength(32);
    expect(keyPair.secretKey).toHaveLength(64);
  };

  describe('encodeIntTo8BytesString', () => {
    it('should generate 8 bytes hex string from a number', () => {
      let min = 1;
      let max = 10000000000;

      const arrayOfNumber = Array.from(
        { length: 10 },
        () => Math.floor(Math.random() * (max - min + 1)) + min,
      );

      arrayOfNumber.forEach((value) => {
        const hexString = Crypto.encodeIntTo8BytesString(value.toString());
        expect(typeof hexString).toBe('string');
        expect(hexString).toMatch(/^[0-9a-fA-F]+$/);
        expect(hexString).toHaveLength(16);
        const buffer = Buffer.from(hexString, 'hex');
        expect(buffer.readBigInt64BE().toString()).toBe(value.toString());
      });
    });
  });

  describe('decode8BytesStringtoBigInt', () => {
    it('should throw an error with non hex strings', () => {
      const arrayOfStrings = Array.from({ length: 10 }, () =>
        randomstring.generate(),
      );

      arrayOfStrings.forEach((value) => {
        expect(() => Crypto.decode8BytesStringtoBigInt(value)).toThrow();
      });
    });
  });

  describe('generateKeyPairs', () => {
    it('should generate correct keypairs', () => {
      const keyPair = Crypto.generateKeyPairs();
      checkForValidKeyPairs(keyPair);
    });
  });

  describe('toHexString', () => {
    it('should convert string to hex string', () => {
      const arrayOfStrings = Array.from({ length: 5 }, () =>
        randomstring.generate(),
      );

      arrayOfStrings.forEach((value) => {
        const hexString = Crypto.toHexString(value);
        expect(hexString).toBeTruthy();
        expect(typeof hexString).toBe('string');
        expect(hexString).toMatch(/^[0-9a-fA-F]+$/);
        expect(Buffer.from(hexString, 'hex').toString('utf8')).toEqual(value);
      });
    });

    it('should convert Uint8Array to hex string', () => {
      const arrayOfUint8Array = Array.from(
        { length: 5 },
        () => new Uint8Array(Buffer.from(randomstring.generate())),
      );

      arrayOfUint8Array.forEach((value) => {
        const hexString = Crypto.toHexString(value);

        expect(hexString).toBeTruthy();
        expect(typeof hexString).toBe('string');
        expect(hexString).toMatch(/^[0-9a-fA-F]+$/);
        expect(new Uint8Array(Buffer.from(hexString, 'hex'))).toEqual(value);
      });
    });
  });

  describe('fromHexStringToBuffer', () => {
    it('should convert hex string to buffer', () => {
      const arrayOfHexStrings = Array.from({ length: 5 }, () =>
        Buffer.from(randomstring.generate()).toString('hex'),
      );

      arrayOfHexStrings.forEach((value) => {
        const buffer = Crypto.fromHexStringToBuffer(value);
        expect(buffer).toBeTruthy();
        expect(buffer instanceof Buffer).toBeTruthy();
        expect(Buffer.from(buffer).toString('hex')).toEqual(value);
      });
    });
  });

  describe('fromHexStringToRawString', () => {
    it('should convert hex string to the actual string', () => {
      const arrayOfStringAndHexString = Array.from({ length: 5 }, () => {
        const actual = randomstring.generate();
        return {
          actual,
          hex: Buffer.from(actual).toString('hex'),
        };
      });

      arrayOfStringAndHexString.forEach((value) => {
        const converted = Crypto.fromHexStringToRawString(value.hex);
        expect(converted).toBe(value.actual);
      });
    });
  });

  describe('getKeyPairs', () => {
    it('should get keypairs from private key', () => {
      const keypair = Crypto.generateKeyPairs();
      const retrievedKeyPair = Crypto.getKeyPairs(keypair.secretKey);
      checkForValidKeyPairs(retrievedKeyPair);
      expect(retrievedKeyPair).toEqual(keypair);
    });

    it('should get keypairs from buffered private key', () => {
      const keypair = Crypto.generateKeyPairs();
      const retrievedKeyPair = Crypto.getKeyPairs(
        Buffer.from(keypair.secretKey),
      );
      checkForValidKeyPairs(retrievedKeyPair);
      expect(retrievedKeyPair).toEqual(keypair);
    });
  });

  describe('deriveKeyPair', () => {
    it('should generate different pairs when derived', () => {
      const keyPairs = Array.from({ length: 5 }, () => {
        return Crypto.generateKeyPairs();
      });

      keyPairs.forEach((keyPair) => {
        const generatedKeyPairs: typeof keyPairs = [keyPair];

        for (let i = 0; i <= 5; i++) {
          const derivedKeyPair = Crypto.deriveKeyPair(keyPair, i);

          for (const existing of generatedKeyPairs) {
            expect(derivedKeyPair).not.toEqual(existing);
          }

          generatedKeyPairs.push(derivedKeyPair);
        }
      });
    });
  });

  describe('generateWalletAddress', () => {
    it('should generate correct wallet address', () => {
      const keypair = Crypto.generateKeyPairs();
      const retrievedKeyPair = Crypto.getKeyPairs(keypair.secretKey);
      checkForValidKeyPairs(retrievedKeyPair);
      expect(retrievedKeyPair).toEqual(keypair);
    });

    it('should get keypairs from buffered private key', () => {
      const keypair = Crypto.generateKeyPairs();
      const retrievedWalletAddress = Crypto.generateWalletAddress(
        keypair.publicKey,
      );

      expect(typeof retrievedWalletAddress).toBe('string');
      expect(retrievedWalletAddress).toMatch(/^ph-\w+/);
      const [_, address] = retrievedWalletAddress.split('-');
      expect(Buffer.from(address, 'hex')).toHaveLength(20);
    });
  });

  describe('signMessage', () => {
    it('should be able to sign message with private key', () => {
      const keyPair = Crypto.generateKeyPairs();

      const messages = Array.from({ length: 5 }, () => {
        return randomstring.generate();
      });
      messages.forEach((value) => {
        const signedMessage = Crypto.signMessage(keyPair.secretKey, value);
        expect(signedMessage).toBeTruthy();
        expect(typeof signedMessage).toBe('string');
        const signUint8Array = new Uint8Array(
          Crypto.fromHexStringToBuffer(signedMessage),
        );
        const messageUint8Array = new TextEncoder().encode(value);
        expect(
          nacl.sign.detached.verify(
            messageUint8Array,
            signUint8Array,
            keyPair.publicKey,
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('isValid', () => {
    it('should be check for a valid signature', () => {
      const keyPair = Crypto.generateKeyPairs();

      const messages = Array.from({ length: 5 }, () => {
        return randomstring.generate();
      });
      messages.forEach((value) => {
        const signedMessage = Crypto.signMessage(keyPair.secretKey, value);
        expect(
          Crypto.isValid(keyPair.publicKey, value, signedMessage),
        ).toBeTruthy();
      });
    });
  });
});
