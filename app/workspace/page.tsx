import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

// Redirect to unique board canvas
export default async function WorkspaceRootPage() {
  await auth.protect();
  const newBoardId = crypto.randomUUID();
  redirect(`/workspace/${newBoardId}`);
}

