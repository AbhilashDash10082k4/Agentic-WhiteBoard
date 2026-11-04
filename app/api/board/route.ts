import { NextRequest } from "next/server";
import { boardController } from "@/controllers/board.controller";

// API Route: POST /api/board
// Delegated to BoardController -> BoardService -> BoardRepository -> Database
export async function POST(req: NextRequest) {
  return boardController.handleCreateBoard(req);
}
