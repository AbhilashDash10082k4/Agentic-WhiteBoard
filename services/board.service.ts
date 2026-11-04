import {
  boardRepository,
  BoardRepository,
} from "@/repositories/board.repository";
import { type Board } from "@/db";

export interface CreateBoardDTO {
  email: string;
  name?: string;
  boardId?: string;
}

// Service containing core business logic for board creation
export class BoardService {
  constructor(private readonly repository: BoardRepository = boardRepository) {}

  // Create a board with business defaults and user association
  async createBoard(dto: CreateBoardDTO): Promise<Board> {
    if (!dto.email) {
      throw new Error("User email is required to create a board");
    }

    // Resolve user to link foreign key if registered
    const user = await this.repository.findUserByEmail(dto.email);

    // Business defaults: auto-generate UUID and fallback title
    const publicBoardId = dto.boardId?.trim() || crypto.randomUUID();
    const boardTitle = dto.name?.trim() || "Untitled Board";

    // Persist via repository layer
    const newBoard = await this.repository.insertBoard({
      boardId: publicBoardId,
      name: boardTitle,
      userId: user ? user.id : null,
      createdBy: dto.email,
    });

    return newBoard;
  }
}

export const boardService = new BoardService();
