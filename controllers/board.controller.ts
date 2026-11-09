import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { boardService, BoardService } from "@/services/board.service";

// Controller controlling request input, auth extraction, and response output
export class BoardController {
  constructor(private readonly service: BoardService = boardService) {}

  // Handle POST /api/board (save / update board)
  async handleSaveBoard(req: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate and extract email from Clerk session
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

      if (!clerkUser || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: Active Clerk session with email required",
          },
          { status: 401 },
        );
      }

      // Parse optional payload safely
      let body: { name?: string; boardId?: string } = {};
      try {
        body = await req.json();
      } catch {
        // Fallback to empty body
      }

      // Delegate business logic to service layer
      const savedBoard = await this.service.saveBoard({
        email: userEmail,
        name: body.name,
        boardId: body.boardId,
      });

      return NextResponse.json(
        { success: true, data: savedBoard },
        { status: 200 },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }
  }

  // Handle GET /api/board or GET /api/board?boardId=...
  async handleGetBoard(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const boardId = searchParams.get("boardId");

      // Case 1: Specific board requested
      if (boardId) {
        const board = await this.service.getBoardById(boardId);
        if (!board) {
          return NextResponse.json(
            { success: false, message: "Board not found" },
            { status: 404 },
          );
        }
        return NextResponse.json(
          { success: true, data: board },
          { status: 200 },
        );
      }

      // Case 2: List all boards for the authenticated user
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

      if (!clerkUser || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: Active Clerk session required",
          },
          { status: 401 },
        );
      }

      const userBoards = await this.service.getUserBoards(userEmail);
      return NextResponse.json(
        { success: true, data: userBoards },
        { status: 200 },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }
  }

  // Handle POST /api/board/data (save/upsert canvas elements, appState, files)
  async handleSaveBoardData(req: NextRequest): Promise<NextResponse> {
    try {
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

      if (!clerkUser || !userEmail) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized: Active Clerk session required",
          },
          { status: 401 },
        );
      }

      const body = await req.json();
      if (!body.boardId) {
        return NextResponse.json(
          { success: false, message: "Missing required boardId in body" },
          { status: 400 },
        );
      }

      const savedData = await this.service.saveBoardData({
        email: userEmail,
        boardId: body.boardId,
        elements: body.elements,
        appState: body.appState,
        files: body.files,
      });

      return NextResponse.json(
        { success: true, data: savedData },
        { status: 200 },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }
  }

  // Handle GET /api/board/data?boardId=...
  async handleGetBoardData(req: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(req.url);
      const boardId = searchParams.get("boardId");

      if (!boardId) {
        return NextResponse.json(
          { success: false, message: "Missing required boardId query param" },
          { status: 400 },
        );
      }

      const data = await this.service.getBoardDataByBoardId(boardId);
      return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }
  }
}

export const boardController = new BoardController();
