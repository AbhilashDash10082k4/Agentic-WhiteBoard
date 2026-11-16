import { credentialController } from "@/controllers/credential.controller";

export const dynamic = "force-dynamic";

// GET /api/credentials/providers - list supported providers metadata
export async function GET() {
  return credentialController.handleListProviders();
}

