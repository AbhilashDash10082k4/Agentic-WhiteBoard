import "server-only";
import crypto from "node:crypto";
import {
  credentialRepository,
  CredentialRepository,
} from "@/repositories/credential.repository";
import { generateKmsDataKey, decryptKmsDataKey } from "@/lib/security/kms";
import { encryptPayload, decryptPayload } from "@/lib/security/encryption";

export type SupportedProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "groq"
  | "mistral"
  | "deepseek"
  | "openrouter"
  | "custom";

export interface ProviderDefinition {
  id: SupportedProvider;
  name: string;
  description: string;
  defaultEndpoint?: string;
  keyPrefix?: string;
}

export const SUPPORTED_PROVIDERS: ProviderDefinition[] = [
  { id: "openai", name: "OpenAI", description: "GPT-4o, GPT-4o-mini", keyPrefix: "sk-" },
  { id: "anthropic", name: "Anthropic", description: "Claude 3.5 Sonnet, Claude 3 Opus", keyPrefix: "sk-ant-" },
  { id: "google", name: "Google Gemini", description: "Gemini 2.5 Flash, Gemini 1.5 Pro", keyPrefix: "AIza" },
  { id: "groq", name: "Groq", description: "Llama 3, Mixtral ultra-fast inference", keyPrefix: "gsk_" },
  { id: "mistral", name: "Mistral AI", description: "Mistral Large, Codestral" },
  { id: "deepseek", name: "DeepSeek", description: "DeepSeek V3, DeepSeek R1" },
  { id: "openrouter", name: "OpenRouter", description: "Unified gateway across all frontier models", keyPrefix: "sk-or-" },
  { id: "custom", name: "Custom (OpenAI-Compatible)", description: "Self-hosted vLLM, Ollama, LMStudio" },
];

export interface CredentialConfig {
  apiKey: string;
  endpointUrl?: string;
  organizationId?: string;
}

export interface SafeCredentialMetadata {
  id: string;
  provider: string;
  label: string;
  maskedApiKey: string;
  endpointUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveCredentialDTO {
  userId: string;
  userEmail: string;
  provider: string;
  label: string;
  config: CredentialConfig;
}

export interface UpdateCredentialDTO {
  credentialId: string;
  userId: string;
  label?: string;
  config?: CredentialConfig;
}

// Utility to mask secret keys safely for client metadata display
export function maskApiKey(key: string): string {
  if (!key) return "••••••••";
  if (key.length <= 8) return "••••" + key.slice(-2);
  const head = key.slice(0, 4);
  const tail = key.slice(-4);
  return `${head}...${tail}`;
}

export class CredentialService {
  constructor(
    private readonly repository: CredentialRepository = credentialRepository
  ) {}

  // Save new credential using AWS KMS envelope encryption + AES-256-GCM
  async saveCredential(dto: SaveCredentialDTO): Promise<SafeCredentialMetadata> {
    const credentialId = crypto.randomUUID();
    const version = 1;

    await this.repository.ensureAuthUser(dto.userId, dto.userEmail);

    const { plaintextDek, encryptedDek, kmsKeyId } = await generateKmsDataKey({
      userId: dto.userId,
      credentialId,
    });

    try {
      const plaintextConfig = JSON.stringify(dto.config);
      const { ciphertext, nonce, authTag } = encryptPayload({
        plaintext: plaintextConfig,
        dek: plaintextDek,
        userId: dto.userId,
        credentialId,
        version,
      });

      const record = await this.repository.createCredential({
        id: credentialId,
        userId: dto.userId,
        provider: dto.provider,
        label: dto.label,
        encryptedPayload: ciphertext,
        encryptedDek,
        nonce,
        authTag,
        encryptionVersion: version,
        kmsKeyId,
      });

      return {
        id: record.id,
        provider: record.provider,
        label: record.label,
        maskedApiKey: maskApiKey(dto.config.apiKey),
        endpointUrl: dto.config.endpointUrl,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      };
    } finally {
      plaintextDek.fill(0);
    }
  }

  // List safe credential metadata for authenticated user (never outputs plaintext keys)
  async listUserCredentials(userId: string): Promise<SafeCredentialMetadata[]> {
    const records = await this.repository.findCredentialsByUserId(userId);

    return records.map((r) => {
      // ponytail: payload remains encrypted. We read masked representation without decrypting the payload on list.
      return {
        id: r.id,
        provider: r.provider,
        label: r.label,
        maskedApiKey: "••••••••",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });
  }

  // Retrieve decrypted credential config internally for server-side AI execution only
  async getDecryptedCredential(
    credentialId: string,
    userId: string
  ): Promise<CredentialConfig> {
    const record = await this.repository.findCredentialById(credentialId, userId);
    if (!record) {
      throw new Error("Credential not found or unauthorized access.");
    }

    const plaintextDek = await decryptKmsDataKey({
      encryptedDek: record.encryptedDek,
      kmsKeyId: record.kmsKeyId,
      userId,
      credentialId: record.id,
    });

    try {
      const decryptedBuf = decryptPayload({
        ciphertext: record.encryptedPayload,
        nonce: record.nonce,
        authTag: record.authTag,
        dek: plaintextDek,
        userId,
        credentialId: record.id,
        version: record.encryptionVersion,
      });

      try {
        const configJson = decryptedBuf.toString("utf8");
        return JSON.parse(configJson) as CredentialConfig;
      } finally {
        decryptedBuf.fill(0);
      }
    } finally {
      plaintextDek.fill(0);
    }
  }

  // Replace / update existing credential with new envelope encryption
  async updateCredential(dto: UpdateCredentialDTO): Promise<SafeCredentialMetadata> {
    const existing = await this.repository.findCredentialById(dto.credentialId, dto.userId);
    if (!existing) {
      throw new Error("Credential not found or unauthorized access.");
    }

    if (dto.config) {
      const nextVersion = existing.encryptionVersion + 1;
      const { plaintextDek, encryptedDek, kmsKeyId } = await generateKmsDataKey({
        userId: dto.userId,
        credentialId: dto.credentialId,
      });

      try {
        const plaintextConfig = JSON.stringify(dto.config);
        const { ciphertext, nonce, authTag } = encryptPayload({
          plaintext: plaintextConfig,
          dek: plaintextDek,
          userId: dto.userId,
          credentialId: dto.credentialId,
          version: nextVersion,
        });

        const updated = await this.repository.updateCredential(dto.credentialId, dto.userId, {
          label: dto.label,
          encryptedPayload: ciphertext,
          encryptedDek,
          nonce,
          authTag,
          encryptionVersion: nextVersion,
          kmsKeyId,
        });

        if (!updated) throw new Error("Failed to update credential.");

        return {
          id: updated.id,
          provider: updated.provider,
          label: updated.label,
          maskedApiKey: maskApiKey(dto.config.apiKey),
          endpointUrl: dto.config.endpointUrl,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        };
      } finally {
        plaintextDek.fill(0);
      }
    }

    const updated = await this.repository.updateCredential(dto.credentialId, dto.userId, {
      label: dto.label,
    });
    if (!updated) throw new Error("Failed to update credential label.");

    return {
      id: updated.id,
      provider: updated.provider,
      label: updated.label,
      maskedApiKey: "••••••••",
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  // Delete/revoke credential enforcing user ownership
  async deleteCredential(credentialId: string, userId: string): Promise<boolean> {
    return this.repository.deleteCredential(credentialId, userId);
  }

  // Return available supported providers
  getSupportedProviders(): ProviderDefinition[] {
    return SUPPORTED_PROVIDERS;
  }
}

export const credentialService = new CredentialService();

