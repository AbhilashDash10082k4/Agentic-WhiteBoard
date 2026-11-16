import "server-only";

export interface AadContext {
  userId: string;
  credentialId: string;
  version: number;
}

// Build deterministic Authenticated Additional Data (AAD) buffer binding ciphertext to user, credential, and version
export function buildAad({ userId, credentialId, version }: AadContext): Buffer {
  if (!userId || typeof userId !== "string") {
    throw new Error("AAD construction error: valid userId string required");
  }
  if (!credentialId || typeof credentialId !== "string") {
    throw new Error("AAD construction error: valid credentialId string required");
  }
  if (typeof version !== "number" || version < 1) {
    throw new Error("AAD construction error: valid version integer required");
  }

  // Canonical format: v{version}:{userId}:{credentialId}
  const canonicalString = `v${version}:${userId}:${credentialId}`;
  return Buffer.from(canonicalString, "utf8");
}

