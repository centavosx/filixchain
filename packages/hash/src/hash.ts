import * as crypto from 'crypto';

export class AppHash {
  static HASH_REGEX = /^[0-9a-fA-F]+$/g;

  static createSha256Hash(data: string | Buffer) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static createSha512Hash(data: string | Buffer) {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  static createRipemd160(hashString: string) {
    return crypto
      .createHash('ripemd160')
      .update(Buffer.from(hashString, 'hex'))
      .digest('hex');
  }

  static generateMerkleRoot(transactions: string[]): string {
    let hashes = transactions.map((tx) => AppHash.createSha256Hash(tx));

    while (hashes.length > 1) {
      if (hashes.length % 2 === 1) {
        hashes.push(hashes[hashes.length - 1]);
      }

      const tempHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const combined = hashes[i] + hashes[i + 1];
        tempHashes.push(AppHash.createSha256Hash(combined));
      }

      hashes = tempHashes;
    }

    return hashes[0];
  }
}
