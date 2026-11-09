import { NextRequest } from "next/server";
import { boardController } from "@/controllers/board.controller";

// API Route: POST /api/board/data (save/upsert canvas elements, appState, files)
export async function POST(req: NextRequest) {
  return boardController.handleSaveBoardData(req);
}

// API Route: GET /api/board/data?boardId=... (fetch canvas elements, appState, files)
export async function GET(req: NextRequest) {
  return boardController.handleGetBoardData(req);
}

