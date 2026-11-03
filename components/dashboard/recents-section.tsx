"use client";

import * as React from "react";
import {
  LayoutGrid,
  List,
  CheckCircle2,
  Lightbulb,
  Boxes,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";

interface RecentBoard {
  id: string;
  name: string;
  modifiedText: string;
  onlineUsers?: number;
  space?: string;
  lastOpened: string;
  owner: string;
  icon: React.ReactNode;
}

export function RecentsSection() {
  const { user } = useUser();
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  const userName = user?.fullName || "Abhilash Dash";

  const recentBoards: RecentBoard[] = [
    {
      id: "board-1",
      name: "2026 It izz",
      modifiedText: `Modified by ${userName}`,
      lastOpened: "Oct 30",
      owner: userName,
      icon: (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400">
          <CheckCircle2 className="size-4" />
        </div>
      ),
    },
    {
      id: "board-2",
      name: "Concepts",
      modifiedText: `Modified by ${userName}`,
      lastOpened: "Oct 30",
      owner: userName,
      icon: (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
          <Lightbulb className="size-4" />
        </div>
      ),
    },
    {
      id: "board-3",
      name: "Project Architectures",
      modifiedText: `Modified by ${userName}`,
      lastOpened: "Jun 27",
      owner: userName,
      icon: (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400">
          <Boxes className="size-4" />
        </div>
      ),
    },
  ];

  return (
    <section className="w-full">
      {/* Section Top Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
          Jump back to recents
        </h2>

        {/* View mode toggle */}
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-xs"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-xs"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Recents Container */}
      {viewMode === "list" ? (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-medium">
                <th className="pb-2.5 font-medium min-w-[200px]">Name</th>
                <th className="pb-2.5 font-medium hidden sm:table-cell">Online users</th>
                <th className="pb-2.5 font-medium hidden md:table-cell">Space</th>
                <th className="pb-2.5 font-medium">Last opened</th>
                <th className="pb-2.5 font-medium">Owner</th>
                <th className="pb-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentBoards.map((board) => (
                <tr
                  key={board.id}
                  className="group hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  {/* Title & icon */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {board.icon}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                          {board.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {board.modifiedText}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Online users */}
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">
                    -
                  </td>

                  {/* Space */}
                  <td className="py-3 text-muted-foreground hidden md:table-cell">
                    {board.space || "-"}
                  </td>

                  {/* Last opened */}
                  <td className="py-3 text-muted-foreground">
                    {board.lastOpened}
                  </td>

                  {/* Owner */}
                  <td className="py-3 text-foreground/80 font-medium truncate max-w-[140px]">
                    {board.owner}
                  </td>

                  {/* Options */}
                  <td className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid view fallback */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {recentBoards.map((board) => (
            <div
              key={board.id}
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 hover:shadow-xs hover:border-foreground/20 transition-all cursor-pointer h-36"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {board.icon}
                  <span className="font-semibold text-sm text-foreground truncate">
                    {board.name}
                  </span>
                </div>
                <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col text-[11px] text-muted-foreground gap-0.5">
                <span>{board.modifiedText}</span>
                <span className="text-muted-foreground/80">Opened {board.lastOpened}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

