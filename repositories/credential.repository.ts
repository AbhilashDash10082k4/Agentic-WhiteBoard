import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  authUsers,
  userCredentials,
  type NewUserCredential,
  type UserCredential,
} from "@/db/schema";

export interface CreateCredentialRepositoryDTO {
  id?: string;
  userId: string;
  provider: string;
  label: string;
  encryptedPayload: Buffer;
  encryptedDek: Buffer;
  nonce: Buffer;
  authTag: Buffer;
  encryptionVersion: number;
  kmsKeyId: string;
}

export interface UpdateCredentialRepositoryDTO {
  label?: string;
  encryptedPayload?: Buffer;
  encryptedDek?: Buffer;
  nonce?: Buffer;
  authTag?: Buffer;
  encryptionVersion?: number;
  kmsKeyId?: string;
}

// Repository handling all database operations for user_credentials with ownership enforcement
export class CredentialRepository {
  // Ensure the auth.users parent record exists before foreign key insert
  async ensureAuthUser(userId: string, email: string): Promise<void> {
    await db
      .insert(authUsers)
      .values({
        id: userId,
        email,
      })
      .onConflictDoNothing({ target: authUsers.id });
  }

  // Insert a new encrypted credential into user_credentials
  async createCredential(dto: CreateCredentialRepositoryDTO): Promise<UserCredential> {
    const inserted = await db
      .insert(userCredentials)
      .values({
        id: dto.id,
        userId: dto.userId,
        provider: dto.provider.toLowerCase().trim(),
        label: dto.label.trim(),
        encryptedPayload: dto.encryptedPayload,
        encryptedDek: dto.encryptedDek,
        nonce: dto.nonce,
        authTag: dto.authTag,
        encryptionVersion: dto.encryptionVersion,
        kmsKeyId: dto.kmsKeyId,
      })
      .returning();

    return inserted[0];
  }

  // Find all credentials owned by a user
  async findCredentialsByUserId(userId: string): Promise<UserCredential[]> {
    return db
      .select()
      .from(userCredentials)
      .where(eq(userCredentials.userId, userId))
      .orderBy(desc(userCredentials.createdAt));
  }

  // Find single credential enforcing user ownership
  async findCredentialById(
    credentialId: string,
    userId: string
  ): Promise<UserCredential | null> {
    const records = await db
      .select()
      .from(userCredentials)
      .where(
        and(
          eq(userCredentials.id, credentialId),
          eq(userCredentials.userId, userId)
        )
      )
      .limit(1);

    return records[0] ?? null;
  }

  // Update/replace an existing credential enforcing user ownership
  async updateCredential(
    credentialId: string,
    userId: string,
    dto: UpdateCredentialRepositoryDTO
  ): Promise<UserCredential | null> {
    const updated = await db
      .update(userCredentials)
      .set({
        ...(dto.label && { label: dto.label.trim() }),
        ...(dto.encryptedPayload && { encryptedPayload: dto.encryptedPayload }),
        ...(dto.encryptedDek && { encryptedDek: dto.encryptedDek }),
        ...(dto.nonce && { nonce: dto.nonce }),
        ...(dto.authTag && { authTag: dto.authTag }),
        ...(dto.encryptionVersion && { encryptionVersion: dto.encryptionVersion }),
        ...(dto.kmsKeyId && { kmsKeyId: dto.kmsKeyId }),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userCredentials.id, credentialId),
          eq(userCredentials.userId, userId)
        )
      )
      .returning();

    return updated[0] ?? null;
  }

  // Delete/revoke credential enforcing user ownership
  async deleteCredential(credentialId: string, userId: string): Promise<boolean> {
    const deleted = await db
      .delete(userCredentials)
      .where(
        and(
          eq(userCredentials.id, credentialId),
          eq(userCredentials.userId, userId)
        )
      )
      .returning({ id: userCredentials.id });

    return deleted.length > 0;
  }
}

export const credentialRepository = new CredentialRepository();

