import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
} from 'crypto';

const deriveKey = (password: string, salt: Buffer): Buffer => {
  return pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

export const encryptWithPassword = (plaintext: string, password: string) => {
  return new Promise<string>((resolve) => {
    const salt = randomBytes(16);
    const key = deriveKey(password, salt);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    const combined = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ]);
    resolve(combined.toString('base64'));
  });
};

export const decryptWithPassword = (
  encryptedText: string,
  password: string,
) => {
  return new Promise<string>((resolve) => {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    const salt = encryptedBuffer.subarray(0, 16);
    const iv = encryptedBuffer.subarray(16, 28);
    const authTag = encryptedBuffer.subarray(28, 44);
    const encrypted = encryptedBuffer.subarray(44);

    const key = deriveKey(password, salt);

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    resolve(decrypted.toString('utf8'));
  });
};
