import React from "react";
import { RecentsSection } from "@/components/dashboard/recents-section";

// Starred whiteboards page
export default function StarredPage() {
  return (
    <div className="flex flex-col w-full pb-12 pt-4">
      <RecentsSection starredOnly={true} />
    </div>
  );
}
