import React from "react";
import { auth } from "@clerk/nextjs/server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";

// Layout wrapper for dashboard with Clerk auth protection and shadcn sidebar
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all dashboard routes; redirect unauthenticated users to sign-in
  await auth.protect();

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardSidebar />
      <SidebarInset className="min-h-screen bg-background text-foreground flex flex-col">
        <DashboardNavbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
