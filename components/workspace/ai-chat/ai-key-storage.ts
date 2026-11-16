// Client storage helper for user AI API key and provider
const KEY_STORAGE_NAME = "agentic_ai_api_key";
const PROVIDER_STORAGE_NAME = "agentic_ai_provider";

export function getSavedApiKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(KEY_STORAGE_NAME) || "";
  } catch {
    return "";
  }
}

export function saveApiKey(key: string, provider: "gemini" | "openai" = "gemini"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY_STORAGE_NAME, key.trim());
    localStorage.setItem(PROVIDER_STORAGE_NAME, provider);
  } catch {
    // Ignore localStorage errors
  }
}

export function getSavedProvider(): "gemini" | "openai" {
  if (typeof window === "undefined") return "gemini";
  try {
    const p = localStorage.getItem(PROVIDER_STORAGE_NAME);
    return p === "openai" ? "openai" : "gemini";
  } catch {
    return "gemini";
  }
}

