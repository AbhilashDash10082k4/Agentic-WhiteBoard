import {
  boardRepository,
  BoardRepository,
} from "@/repositories/board.repository";
import { type Board, type BoardData } from "@/db";

export interface CreateBoardDTO {
  email: string;
  name?: string;
  boardId?: string;
}

export interface SaveBoardDataDTO {
  email: string;
  boardId: string;
  elements?: unknown;
  appState?: unknown;
  files?: unknown;
  version?: number;
}

// Service containing core business logic for board creation, updates, and canvas data
export class BoardService {
  constructor(private readonly repository: BoardRepository = boardRepository) {}

  // Save or update board with business defaults and user association
  async saveBoard(dto: CreateBoardDTO): Promise<Board> {
    if (!dto.email) {
      throw new Error("User email is required to create a board");
    }

    // Resolve user to link foreign key if registered
    const user = await this.repository.findUserByEmail(dto.email);

    // Business defaults: auto-generate UUID and fallback title
    const publicBoardId = dto.boardId?.trim() || crypto.randomUUID();
    const boardTitle = dto.name?.trim() || "Untitled";

    // Persist or update via repository layer
    const savedBoard = await this.repository.upsertBoard({
      boardId: publicBoardId,
      name: boardTitle,
      userId: user ? user.id : null,
      createdBy: dto.email,
    });

    return savedBoard;
  }

  // Retrieve existing board by ID
  async getBoardById(boardId: string): Promise<Board | null> {
    if (!boardId) return null;
    return this.repository.findBoardById(boardId);
  }

  // Retrieve all boards for an authenticated user
  async getUserBoards(email: string): Promise<Board[]> {
    if (!email) return [];
    return this.repository.findBoardsByUserEmail(email);
  }

  // Save or update canvas data (elements, appState, files) ensuring board exists
  async saveBoardData(dto: SaveBoardDataDTO): Promise<BoardData> {
    if (!dto.boardId) {
      throw new Error("boardId is required to save canvas data");
    }

    // Ensure board row exists in `boards` to satisfy foreign key constraint
    let board = await this.repository.findBoardById(dto.boardId);
    if (!board) {
      const user = dto.email ? await this.repository.findUserByEmail(dto.email) : null;
      board = await this.repository.upsertBoard({
        boardId: dto.boardId,
        name: "Untitled",
        userId: user ? user.id : null,
        createdBy: dto.email || null,
      });
    }

    // Extract safe serializable layout properties from appState
    let safeAppState: unknown = dto.appState;
    if (dto.appState && typeof dto.appState === "object") {
      const raw = dto.appState as Record<string, unknown>;
      safeAppState = {
        viewBackgroundColor: raw.viewBackgroundColor,
        gridSize: raw.gridSize,
        theme: raw.theme,
        scrollX: raw.scrollX,
        scrollY: raw.scrollY,
        zoom: raw.zoom,
      };
    }

    const result = await this.repository.upsertBoardData({
      projectId: dto.boardId,
      elements: dto.elements,
      appState: safeAppState,
      files: dto.files,
      clientVersion: dto.version,
    });

    if (result.conflict) {
      throw new Error("OCC_CONFLICT_DETECTED");
    }

    return result.record;
  }

  // Retrieve canvas data by boardId
  async getBoardDataByBoardId(boardId: string): Promise<BoardData | null> {
    if (!boardId) return null;
    return this.repository.findBoardDataByBoardId(boardId);
  }
}

export const boardService = new BoardService();
