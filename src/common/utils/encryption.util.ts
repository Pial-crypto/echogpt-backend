import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey() {
  const secret = process.env.ENCRYPTION_KEY;

  if (!secret) {
    throw new Error(
      'ENCRYPTION_KEY is not configured',
    );
  }

  return createHash('sha256')
    .update(secret)
    .digest();
}

export function encrypt(value: string): string {
  const iv = randomBytes(16);
  const key = getKey();

  const cipher = createCipheriv(
    ALGORITHM,
    key,
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

export function decrypt(value: string): string {
  const [ivHex, authTagHex, encryptedHex] =
    value.split(':');

  const key = getKey();

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, 'hex'),
  );

  decipher.setAuthTag(
    Buffer.from(authTagHex, 'hex'),
  );

  const decrypted = Buffer.concat([
    decipher.update(
      Buffer.from(encryptedHex, 'hex'),
    ),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}