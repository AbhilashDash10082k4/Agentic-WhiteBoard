import { NextRequest } from "next/server";
import { aiController } from "@/controllers/ai.controller";

// API Route: POST /api/ai/generate
export async function POST(req: NextRequest) {
  return aiController.handleGenerateDiagram(req);
}

