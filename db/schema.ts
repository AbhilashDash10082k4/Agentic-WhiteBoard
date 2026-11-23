import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Custom PostgreSQL BYTEA column type
export const bytea = customType<{ data: Buffer; default: false }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  credit: integer("credit").default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  boardId: text("board_id").notNull().unique(),
  name: text("name"),
  userId: integer("user_id").references(() => users.id),
  createdBy: text("created_by"),
  isStarred: boolean("is_starred").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const boardData = pgTable("boardData", {
  id: serial("id").primaryKey(),
  projectId: text("board_id")
    .notNull()
    .unique()
    .references(() => boards.boardId),
  appState: jsonb("appState"),
  files: jsonb("files"),
  elements: jsonb("elements"),
  version: integer("version").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auth schema representation for foreign key reference
export const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
});

// Generic Credential Vault table with envelope encryption
export const userCredentials = pgTable(
  "user_credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    label: text("label").notNull(),
    encryptedPayload: bytea("encrypted_payload").notNull(),
    encryptedDek: bytea("encrypted_dek").notNull(),
    nonce: bytea("nonce").notNull(),
    authTag: bytea("auth_tag").notNull(),
    encryptionVersion: integer("encryption_version").notNull().default(1),
    kmsKeyId: text("kms_key_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_credentials_user_provider_idx").on(table.userId, table.provider),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type BoardData = typeof boardData.$inferSelect;
export type NewBoardData = typeof boardData.$inferInsert;
export type UserCredential = typeof userCredentials.$inferSelect;
export type NewUserCredential = typeof userCredentials.$inferInsert;
