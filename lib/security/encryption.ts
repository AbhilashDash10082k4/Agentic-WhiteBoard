import "server-only";
import crypto from "node:crypto";
import { buildAad, AadContext } from "./aad";

export interface EncryptedPayloadResult {
  ciphertext: Buffer;
  nonce: Buffer;
  authTag: Buffer;
}

export interface EncryptPayloadOptions extends AadContext {
  plaintext: string | Buffer;
  dek: Buffer;
}

export interface DecryptPayloadOptions extends AadContext {
  ciphertext: Buffer;
  nonce: Buffer;
  authTag: Buffer;
  dek: Buffer;
}

// Encrypt plaintext with AES-256-GCM bound to AAD context (userId, credentialId, version)
export function encryptPayload(opts: EncryptPayloadOptions): EncryptedPayloadResult {
  if (!opts.dek || opts.dek.length !== 32) {
    throw new Error("Encryption error: DEK must be a 256-bit (32 bytes) Buffer");
  }

  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", opts.dek, nonce);

  const aad = buildAad({
    userId: opts.userId,
    credentialId: opts.credentialId,
    version: opts.version,
  });
  cipher.setAAD(aad);

  const plaintextBuf =
    typeof opts.plaintext === "string" ? Buffer.from(opts.plaintext, "utf8") : opts.plaintext;

  try {
    const ciphertext = Buffer.concat([cipher.update(plaintextBuf), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      nonce,
      authTag,
    };
  } finally {
    // Clear temporary plaintext buffer if created
    if (typeof opts.plaintext === "string") {
      plaintextBuf.fill(0);
    }
  }
}

// Decrypt AES-256-GCM ciphertext verifying matching AAD and authentication tag
export function decryptPayload(opts: DecryptPayloadOptions): Buffer {
  if (!opts.dek || opts.dek.length !== 32) {
    throw new Error("Decryption error: DEK must be a 256-bit (32 bytes) Buffer");
  }
  if (!opts.nonce || opts.nonce.length !== 12) {
    throw new Error("Decryption error: nonce must be 12 bytes");
  }
  if (!opts.authTag || opts.authTag.length !== 16) {
    throw new Error("Decryption error: authTag must be 16 bytes");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", opts.dek, opts.nonce);
  decipher.setAuthTag(opts.authTag);

  const aad = buildAad({
    userId: opts.userId,
    credentialId: opts.credentialId,
    version: opts.version,
  });
  decipher.setAAD(aad);

  try {
    return Buffer.concat([decipher.update(opts.ciphertext), decipher.final()]);
  } catch {
    throw new Error("Decryption failed: Ciphertext corrupted, auth tag mismatch, or AAD mismatch");
  }
}

