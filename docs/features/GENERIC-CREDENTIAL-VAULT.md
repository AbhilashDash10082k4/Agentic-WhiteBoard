# Feature Specification: Generic Credential Vault & AWS KMS Envelope Encryption

## 1. Current State
- **Generic Multi-Provider Credential Vault**: Supports unlimited AI providers (`openai`, `anthropic`, `google`, `groq`, `mistral`, `deepseek`, `openrouter`, `custom` OpenAI-compatible endpoints) without modifying database schema.
- **Envelope Encryption**:
  - AWS KMS `GenerateDataKey` generates unique 256-bit DEK per credential.
  - AES-256-GCM encrypts serialized JSON credential configurations.
  - Unique 12-byte random nonce per operation.
  - Authenticated Additional Data (AAD) canonical binding: `v{version}:{userId}:{credentialId}`.
  - KMS-wrapped DEK stored alongside ciphertext; plaintext DEKs are never persisted and cleared with `.fill(0)` in finally blocks.
  - `EncryptionContext`: `{ purpose: "user-api-credential", userId, credentialId }`.
- **API & Security Guarantees**:
  - REST endpoints (`/api/credentials`, `/api/credentials/[id]`, `/api/credentials/providers`) with Zod validation on every input.
  - `Cache-Control: no-store, no-cache, must-revalidate, private` headers on all credential responses.
  - Frontend receives only masked credential metadata (`••••••••` / `sk-...1234`), never plaintext secrets.
  - `import "server-only"` import-time protection prevents secret leak to client bundles.
  - Ownership enforced on all repository queries with compound `and(eq(id), eq(userId))` checks.
  - Isolated development KMS mock adapter for local offline testing; throws fast in production if KMS is unconfigured.
- **Refactoring & DRY Code**:
  - Reusable `requireAuthUser()` helper in `lib/auth.ts` eliminating repetitive Clerk session verification.
  - Chained properties replaced with descriptive local variable names across views and controllers.

## 2. Data Flow
```
Client (UI / REST Request)
  │
  ├─> POST /api/credentials { provider, label, apiKey, endpointUrl }
  │     │
  │     ├─> controllers/credential.controller.ts (Zod validation & requireAuthUser guard)
  │     │
  │     └─> services/credential.service.ts
  │           │
  │           ├─> lib/security/kms.ts: generateKmsDataKey(userId, credentialId)
  │           │     └─> AWS KMS GenerateDataKey (KeySpec: "AES_256", EncryptionContext)
  │           │
  │           ├─> lib/security/aad.ts: buildAad(userId, credentialId, version)
  │           │
  │           ├─> lib/security/encryption.ts: encryptPayload(AES-256-GCM + 12B nonce)
  │           │
  │           ├─> repositories/credential.repository.ts
  │           │     └─> user_credentials table (stores ciphertext, wrapped DEK, nonce, tag)
  │           │
  │           └─> Zeroes DEK memory via dek.fill(0)
  │
  └─> Returns Safe Metadata { id, provider, label, maskedApiKey, createdAt, updatedAt }
```

## 3. Future Improvements
- Periodic automated KMS key rotation with background batch re-encryption.
- Granular credential access logs with audit trail tracking timestamp and requesting service.
- Quota alerts per provider credential tracking spend and token utilization.

