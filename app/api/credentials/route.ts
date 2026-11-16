import { NextRequest } from "next/server";
import { credentialController } from "@/controllers/credential.controller";

export const dynamic = "force-dynamic";

// GET /api/credentials - list safe credential metadata
export async function GET() {
  return credentialController.handleListCredentials();
}

// POST /api/credentials - add new encrypted credential
export async function POST(req: NextRequest) {
  return credentialController.handleCreateCredential(req);
}

