import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { boardService, BoardService } from "@/services/board.service";

// Controller controlling request input, auth extraction, and response output
export class BoardController {
  constructor(private readonly service: BoardService = boardService) {}

  // Handle POST /api/board
  async handleCreateBoard(req: NextRequest): Promise<NextResponse> {
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
        // Empty or non-JSON body is acceptable (defaults will apply)
      }

      // Delegate business logic to service layer
      const createdBoard = await this.service.createBoard({
        email: userEmail,
        name: body.name,
        boardId: body.boardId,
      });

      return NextResponse.json(
        { success: true, data: createdBoard },
        { status: 201 },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, message }, { status: 500 });
    }
  }
}

export const boardController = new BoardController();
