import { NextRequest } from "next/server";
import { boardController } from "@/controllers/board.controller";

// API Route: POST /api/board (save / update board)
export async function POST(req: NextRequest) {
  return boardController.handleSaveBoard(req);
}

// API Route: GET /api/board?boardId=...
export async function GET(req: NextRequest) {
  return boardController.handleGetBoard(req);
}
