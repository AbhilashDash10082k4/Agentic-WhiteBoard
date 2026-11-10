import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type BoardData = typeof boardData.$inferSelect;
export type NewBoardData = typeof boardData.$inferInsert;
