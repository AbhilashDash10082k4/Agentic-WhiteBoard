import {
  db,
  boards,
  users,
  boardData,
  type NewBoard,
  type Board,
  type User,
  type BoardData,
} from "@/db";
import { eq, desc, sql, and } from "drizzle-orm";

// Repository handles direct database interactions for boards and user lookups
export class BoardRepository {
  private migrationChecked = false;

  private async ensureSchema() {
    if (this.migrationChecked) return;
    try {
      await db.execute(
        sql`ALTER TABLE "boards" ADD COLUMN IF NOT EXISTS "is_starred" boolean DEFAULT false NOT NULL;`
      );
      this.migrationChecked = true;
    } catch {
      // Ignore if already applied or restricted
    }
  }

  // Find user by unique email address
  async findUserByEmail(email: string): Promise<User | null> {
    const records = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return records[0] ?? null;
  }

  // Insert a new board record into database
  async insertBoard(data: NewBoard): Promise<Board> {
    await this.ensureSchema();
    const inserted = await db.insert(boards).values(data).returning();
    return inserted[0];
  }

  // Upsert board: update name if board exists, otherwise insert new record
  async upsertBoard(data: NewBoard): Promise<Board> {
    await this.ensureSchema();
    const existing = await this.findBoardById(data.boardId);
    if (existing) {
      const updated = await db
        .update(boards)
        .set({ name: data.name ?? existing.name })
        .where(eq(boards.boardId, data.boardId))
        .returning();

      try {
        await db
          .update(boardData)
          .set({ updatedAt: new Date() })
          .where(eq(boardData.projectId, data.boardId));
      } catch {
        // boardData might not exist yet
      }

      return updated[0];
    }

    return this.insertBoard(data);
  }

  // Find board by its unique public boardId
  async findBoardById(boardId: string): Promise<Board | null> {
    await this.ensureSchema();
    const records = await db
      .select()
      .from(boards)
      .where(eq(boards.boardId, boardId))
      .limit(1);

    return records[0] ?? null;
  }

  // Find all boards owned by user email, ordered by latest edited first
  async findBoardsByUserEmail(
    email: string,
    starredOnly = false
  ): Promise<(Board & { updatedAt?: Date | null })[]> {
    await this.ensureSchema();
    const conditions = starredOnly
      ? and(eq(boards.createdBy, email), eq(boards.isStarred, true))
      : eq(boards.createdBy, email);

    const records = await db
      .select({
        id: boards.id,
        boardId: boards.boardId,
        name: boards.name,
        userId: boards.userId,
        createdBy: boards.createdBy,
        isStarred: boards.isStarred,
        createdAt: boards.createdAt,
        updatedAt: boardData.updatedAt,
      })
      .from(boards)
      .leftJoin(boardData, eq(boards.boardId, boardData.projectId))
      .where(conditions)
      .orderBy(desc(sql`COALESCE(${boardData.updatedAt}, ${boards.createdAt})`));

    return records.map((r) => ({
      ...r,
      updatedAt: r.updatedAt ?? r.createdAt,
    }));
  }

  // Rename board by boardId
  async renameBoard(boardId: string, name: string): Promise<Board | null> {
    await this.ensureSchema();
    const updated = await db
      .update(boards)
      .set({ name })
      .where(eq(boards.boardId, boardId))
      .returning();
    return updated[0] ?? null;
  }

  // Toggle or set star state
  async toggleStar(boardId: string, isStarred: boolean): Promise<Board | null> {
    await this.ensureSchema();
    const updated = await db
      .update(boards)
      .set({ isStarred })
      .where(eq(boards.boardId, boardId))
      .returning();
    return updated[0] ?? null;
  }

  // Delete board record and associated canvas data
  async deleteBoard(boardId: string): Promise<boolean> {
    await this.ensureSchema();
    try {
      await db.delete(boardData).where(eq(boardData.projectId, boardId));
    } catch {
      // Ignore if no boardData row
    }
    const deleted = await db.delete(boards).where(eq(boards.boardId, boardId)).returning();
    return deleted.length > 0;
  }

  // Find canvas elements, appState, and files for a board
  async findBoardDataByBoardId(boardId: string): Promise<BoardData | null> {
    const records = await db
      .select()
      .from(boardData)
      .where(eq(boardData.projectId, boardId))
      .limit(1);

    return records[0] ?? null;
  }

  // Upsert board canvas data with Optimistic Concurrency Control
  async upsertBoardData(data: {
    projectId: string;
    elements?: unknown;
    appState?: unknown;
    files?: unknown;
    clientVersion?: number;
  }): Promise<{ record: BoardData; conflict: boolean }> {
    const existing = await this.findBoardDataByBoardId(data.projectId);

    if (existing) {
      if (
        data.clientVersion !== undefined &&
        existing.version !== undefined &&
        existing.version !== data.clientVersion
      ) {
        return { record: existing, conflict: true };
      }

      const nextVersion = (existing.version ?? 1) + 1;
      const updated = await db
        .update(boardData)
        .set({
          elements: data.elements !== undefined ? data.elements : existing.elements,
          appState: data.appState !== undefined ? data.appState : existing.appState,
          files: data.files !== undefined ? data.files : existing.files,
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(eq(boardData.projectId, data.projectId))
        .returning();

      return { record: updated[0], conflict: false };
    }

    const inserted = await db
      .insert(boardData)
      .values({
        projectId: data.projectId,
        elements: data.elements ?? null,
        appState: data.appState ?? null,
        files: data.files ?? null,
        version: 1,
      })
      .returning();

    return { record: inserted[0], conflict: false };
  }
}

export const boardRepository = new BoardRepository();
