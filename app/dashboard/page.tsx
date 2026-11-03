import React from "react";
import { auth } from "@clerk/nextjs/server";
import { GreetingHeader } from "@/components/dashboard/greeting-header";
import { TemplateSection } from "@/components/dashboard/template-section";
import { RecentsSection } from "@/components/dashboard/recents-section";

// Main dashboard view
export default async function DashboardPage() {
  await auth.protect();

  return (
    <div className="flex flex-col w-full pb-12">
      {/* Dynamic time-of-day greeting header with Clerk user */}
      <GreetingHeader />

      {/* Templates section with 3 placeholders */}
      <TemplateSection />

      {/* Recent boards list / grid */}
      <RecentsSection />
    </div>
  );
}
