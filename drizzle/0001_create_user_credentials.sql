-- Non-destructive migration to create auth schema, auth.users table, and user_credentials table
CREATE SCHEMA IF NOT EXISTS "auth";

CREATE TABLE IF NOT EXISTS "auth"."users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text UNIQUE
);

CREATE TABLE IF NOT EXISTS "user_credentials" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "label" text NOT NULL,
  "encrypted_payload" bytea NOT NULL,
  "encrypted_dek" bytea NOT NULL,
  "nonce" bytea NOT NULL,
  "auth_tag" bytea NOT NULL,
  "encryption_version" integer NOT NULL DEFAULT 1,
  "kms_key_id" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "user_credentials_user_provider_idx"
  ON "user_credentials" ("user_id", "provider");

