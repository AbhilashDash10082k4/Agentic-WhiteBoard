import { db, boards, users, type NewBoard, type Board, type User } from "@/db";
import { eq } from "drizzle-orm";

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
    const inserted = await db
      .insert(boards)
      .values(data)
      .returning();

    return inserted[0];
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
}

export const boardRepository = new BoardRepository();

