import { NextRequest } from "next/server";
import { boardController } from "@/controllers/board.controller";

// API Route: POST /api/board (save / update board)
export async function POST(req: NextRequest) {
  return boardController.handleSaveBoard(req);
}

// API Route: GET /api/board?boardId=... or /api/board?starred=true
export async function GET(req: NextRequest) {
  return boardController.handleGetBoard(req);
}

// API Route: PATCH /api/board (rename or toggle star)
export async function PATCH(req: NextRequest) {
  return boardController.handlePatchBoard(req);
}

// API Route: DELETE /api/board?boardId=...
export async function DELETE(req: NextRequest) {
  return boardController.handleDeleteBoard(req);
}
