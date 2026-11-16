"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { Document } from "@/components/workspace/Document";

const Whiteboard = dynamic(
  () =>
    import("@/components/workspace/Whiteboard").then((mod) => mod.Whiteboard),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface WorkspaceViewProps {
  boardId: string;
}

export function WorkspaceView({ boardId }: WorkspaceViewProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [boardName, setBoardName] = React.useState("Untitled");
  const [activeTab, setActiveTab] = React.useState<string>("whiteboard");

  // Fetch existing board details if already created
  React.useEffect(() => {
    async function loadBoard() {
      try {
        const res = await axios.get(`/api/board?boardId=${boardId}`);
        const fetchedName = res.data?.data?.name;
        if (fetchedName) {
          setBoardName(fetchedName);
        }
      } catch {
        // First time opening board; defaults to "Untitled"
      }
    }

    if (boardId) {
      loadBoard();
    }
  }, [boardId]);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-background">
      {/* Toggle-able Sidebar from top corner button */}
      <WorkspaceSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div
        className={`relative flex h-full w-full flex-col transition-all duration-200 ${
          isSidebarOpen ? "md:pl-64" : "pl-0"
        }`}
      >
        {/* Floating Top Header with Whiteboard / Document Switcher */}
        <WorkspaceHeader
          boardId={boardId}
          initialName={boardName}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* View Switcher: Excalidraw Whiteboard or Document */}
        {activeTab === "whiteboard" ? (
          <Whiteboard boardId={boardId} isSidebarOpen={isSidebarOpen} />
        ) : (
          <Document boardId={boardId} />
        )}
      </div>
    </div>
  );
}
