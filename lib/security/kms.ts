import "server-only";
import {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand,
} from "@aws-sdk/client-kms";
import crypto from "node:crypto";

export interface KmsEncryptionContext {
  userId: string;
  credentialId: string;
}

export interface KmsGenerateDataKeyResult {
  plaintextDek: Buffer;
  encryptedDek: Buffer;
  kmsKeyId: string;
}

export interface KmsDecryptOptions {
  encryptedDek: Buffer;
  kmsKeyId: string;
  userId: string;
  credentialId: string;
}

function buildEncryptionContext(ctx: KmsEncryptionContext): Record<string, string> {
  return {
    purpose: "user-api-credential",
    userId: ctx.userId,
    credentialId: ctx.credentialId,
  };
}

// ponytail: local development KMS mock adapter. Ceils to local crypto. Upgrade path: configure AWS_KMS_KEY_ID in AWS.
class LocalDevKmsAdapter {
  private static readonly DEV_ROOT_KEY = crypto
    .createHash("sha256")
    .update(process.env.DEV_ENCRYPTION_SECRET || "agentic-whiteboard-dev-kms-secret-32b")
    .digest();

  static generateDataKey(ctx: KmsEncryptionContext): KmsGenerateDataKeyResult {
    const plaintextDek = crypto.randomBytes(32);
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", this.DEV_ROOT_KEY, nonce);

    const contextStr = JSON.stringify(buildEncryptionContext(ctx));
    cipher.setAAD(Buffer.from(contextStr, "utf8"));

    const ciphertext = Buffer.concat([cipher.update(plaintextDek), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Pack nonce(12) + tag(16) + ciphertext(32) into mock encryptedDek
    const encryptedDek = Buffer.concat([nonce, tag, ciphertext]);

    return {
      plaintextDek,
      encryptedDek,
      kmsKeyId: "local-dev-mock-kms-key",
    };
  }

  static decryptDataKey(encryptedDek: Buffer, ctx: KmsEncryptionContext): Buffer {
    if (encryptedDek.length < 28) {
      throw new Error("Invalid local dev KMS wrapped key payload");
    }

    const nonce = encryptedDek.subarray(0, 12);
    const tag = encryptedDek.subarray(12, 28);
    const ciphertext = encryptedDek.subarray(28);

    const decipher = crypto.createDecipheriv("aes-256-gcm", this.DEV_ROOT_KEY, nonce);
    decipher.setAuthTag(tag);

    const contextStr = JSON.stringify(buildEncryptionContext(ctx));
    decipher.setAAD(Buffer.from(contextStr, "utf8"));

    try {
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    } catch {
      throw new Error("KMS Decrypt failed: Invalid encryption context or corrupted key");
    }
  }
}

// Global KMS client singleton
let kmsClient: KMSClient | null = null;
function getKmsClient(): KMSClient {
  if (!kmsClient) {
    kmsClient = new KMSClient({
      region: process.env.AWS_REGION || "ap-southeast-1",
    });
  }
  return kmsClient;
}

// Generate a 256-bit DEK wrapped by AWS KMS with bound EncryptionContext
export async function generateKmsDataKey(
  ctx: KmsEncryptionContext
): Promise<KmsGenerateDataKeyResult> {
  const kmsKeyId = process.env.AWS_KMS_KEY_ID;

  if (!kmsKeyId) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AWS KMS is not configured: AWS_KMS_KEY_ID required in production.");
    }
    return LocalDevKmsAdapter.generateDataKey(ctx);
  }

  const client = getKmsClient();
  const command = new GenerateDataKeyCommand({
    KeyId: kmsKeyId,
    KeySpec: "AES_256",
    EncryptionContext: buildEncryptionContext(ctx),
  });

  const response = await client.send(command);

  if (!response.Plaintext || !response.CiphertextBlob) {
    throw new Error("AWS KMS failed to return valid plaintext or ciphertext data key.");
  }

  return {
    plaintextDek: Buffer.from(response.Plaintext),
    encryptedDek: Buffer.from(response.CiphertextBlob),
    kmsKeyId: response.KeyId || kmsKeyId,
  };
}

// Unwrap a KMS-wrapped DEK using the exact same EncryptionContext
export async function decryptKmsDataKey(opts: KmsDecryptOptions): Promise<Buffer> {
  const isDevKey = opts.kmsKeyId === "local-dev-mock-kms-key" || !process.env.AWS_KMS_KEY_ID;

  if (isDevKey) {
    if (process.env.NODE_ENV === "production" && opts.kmsKeyId === "local-dev-mock-kms-key") {
      throw new Error("Cannot decrypt development mock KMS key in production environment.");
    }
    return LocalDevKmsAdapter.decryptDataKey(opts.encryptedDek, {
      userId: opts.userId,
      credentialId: opts.credentialId,
    });
  }

  const client = getKmsClient();
  const command = new DecryptCommand({
    CiphertextBlob: opts.encryptedDek,
    KeyId: opts.kmsKeyId,
    EncryptionContext: buildEncryptionContext({
      userId: opts.userId,
      credentialId: opts.credentialId,
    }),
  });

  const response = await client.send(command);

  if (!response.Plaintext) {
    throw new Error("AWS KMS failed to decrypt data encryption key.");
  }

  return Buffer.from(response.Plaintext);
}

