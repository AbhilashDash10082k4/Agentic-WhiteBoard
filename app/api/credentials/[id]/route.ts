import { NextRequest } from "next/server";
import { credentialController } from "@/controllers/credential.controller";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/credentials/[id] - replace/update credential
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return credentialController.handleUpdateCredential(req, id);
}

// DELETE /api/credentials/[id] - delete/revoke credential
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  return credentialController.handleDeleteCredential(id);
}

