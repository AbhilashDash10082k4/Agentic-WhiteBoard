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
import { eq, desc } from "drizzle-orm";

// Repository handles direct database interactions for boards and user lookups
export class BoardRepository {
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
    const inserted = await db.insert(boards).values(data).returning();

    return inserted[0];
  }

  // Upsert board: update name if board exists, otherwise insert new record
  async upsertBoard(data: NewBoard): Promise<Board> {
    const existing = await this.findBoardById(data.boardId);
    if (existing) {
      const updated = await db
        .update(boards)
        .set({
          name: data.name ?? existing.name,
        })
        .where(eq(boards.boardId, data.boardId))
        .returning();

      return updated[0];
    }

    return this.insertBoard(data);
  }

  // Find board by its unique public boardId
  async findBoardById(boardId: string): Promise<Board | null> {
    const records = await db
      .select()
      .from(boards)
      .where(eq(boards.boardId, boardId))
      .limit(1);

    return records[0] ?? null;
  }

  // Find all boards owned by user email
  async findBoardsByUserEmail(email: string): Promise<Board[]> {
    return db
      .select()
      .from(boards)
      .where(eq(boards.createdBy, email))
      .orderBy(desc(boards.createdAt));
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
      // OCC Check: conflict if client version does not match existing version
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
          elements:
            data.elements !== undefined ? data.elements : existing.elements,
          appState:
            data.appState !== undefined ? data.appState : existing.appState,
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
