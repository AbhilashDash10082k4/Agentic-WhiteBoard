import React from "react";
import { auth } from "@clerk/nextjs/server";

// Protected dashboard page
export default async function DashboardPage() {
  // Enforce auth check on page level
  await auth.protect();

  return <div>Dashboard</div>;
}
