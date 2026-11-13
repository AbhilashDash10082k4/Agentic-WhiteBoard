import React from "react";
import { auth } from "@clerk/nextjs/server";
import { WorkspaceView } from "@/components/workspace/workspace-view";

interface PageProps {
  params: Promise<{ boardId: string }>;
}

// Workspace Page with Board Canvas
export default async function WorkspaceBoardPage({ params }: PageProps) {
  // Enforce server authentication
  await auth.protect();

  const { boardId } = await params;

  return <WorkspaceView boardId={boardId} />;
}
