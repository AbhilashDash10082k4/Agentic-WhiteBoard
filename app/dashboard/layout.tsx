import React from "react";
import { auth } from "@clerk/nextjs/server";

// Layout wrapper for dashboard with Clerk auth protection
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all dashboard routes; redirect unauthenticated users to sign-in
  await auth.protect();

  return <div>{children}</div>;
}
