"use client";

import * as React from "react";
import {
  LayoutGrid,
  List,
  FolderOpen,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentBoard {
  id: string;
  name: string;
  modifiedText: string;
  onlineUsers?: number;
  space?: string;
  lastOpened: string;
  owner: string;
  icon?: React.ReactNode;
}

interface RecentsSectionProps {
  boards?: RecentBoard[];
  onCreateBoard?: () => void;
}

export function RecentsSection({
  boards = [],
  onCreateBoard,
}: RecentsSectionProps) {
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  return (
    <section className="w-full">
      {/* Section Top Header */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Empty State when no boards are present */}
      {boards.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dotted border-border/80 bg-muted/10 px-6 py-14 text-center transition-all">
          {/* Folder Icon */}
          <div className="mb-3.5 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
            <FolderOpen className="size-6 text-muted-foreground" />
          </div>

          {/* Create message */}
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            No boards yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Create your first whiteboard to collaborate with your team, map ideas, and brainstorm together.
          </p>

          {/* + Create Action Button */}
          <Button
            onClick={onCreateBoard}
            size="sm"
            className="mt-4 h-8 gap-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold px-3.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Create</span>
          </Button>
        </div>
      ) : viewMode === "list" ? (
        /* List / Table View */
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
              {boards.map((board) => (
                <tr
                  key={board.id}
                  className="group hover:bg-muted/40 transition-colors cursor-pointer"
                >
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
                  <td className="py-3 text-muted-foreground hidden sm:table-cell">-</td>
                  <td className="py-3 text-muted-foreground hidden md:table-cell">
                    {board.space || "-"}
                  </td>
                  <td className="py-3 text-muted-foreground">{board.lastOpened}</td>
                  <td className="py-3 text-foreground/80 font-medium truncate max-w-[140px]">
                    {board.owner}
                  </td>
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
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {boards.map((board) => (
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
