import * as randomstring from 'randomstring';
import { AppHash } from '../hash';

describe('Hash - AppHash', () => {
  const checkForValidHex = (data: any, size?: number) => {
    expect(data).toBeTruthy();
    expect(typeof data).toBe('string');
    expect(data).toMatch(/^[0-9a-fA-F]+$/);

    if (size !== undefined) {
      const buffer = Buffer.from(data, 'hex');
      expect(buffer).toHaveLength(size);
    }
  };

  describe('createSha256Hash', () => {
    it('should convert string to hex string', () => {
      const arrayOfStrings = Array.from({ length: 5 }, () =>
        randomstring.generate(),
      );

      arrayOfStrings.forEach((value) => {
        const hexString = AppHash.createSha256Hash(value);
        checkForValidHex(hexString, 32);
      });
    });
  });

  describe('createSha512Hash', () => {
    it('should convert string to hex string', () => {
      const arrayOfStrings = Array.from({ length: 5 }, () =>
        randomstring.generate(),
      );

      arrayOfStrings.forEach((value) => {
        const hexString = AppHash.createSha512Hash(value);
        checkForValidHex(hexString, 64);
      });
    });
  });

  describe('createRipemd160', () => {
    it('should convert string to hex string', () => {
      const arrayOfStrings = Array.from({ length: 5 }, () =>
        randomstring.generate(),
      );

      arrayOfStrings.forEach((value) => {
        const hexString = AppHash.createRipemd160(value);
        checkForValidHex(hexString, 20);
      });
    });
  });

  describe('generateMerkleRoot', () => {
    it('should convert string to hex string', () => {
      const arrayOfStrings = Array.from({ length: 5 }, () =>
        randomstring.generate(),
      );

      const hexString = AppHash.generateMerkleRoot(arrayOfStrings);
      checkForValidHex(hexString);
    });
  });
});
