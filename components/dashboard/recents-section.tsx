"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";
import {
  LayoutGrid,
  List,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Layout,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { type Board } from "@/db";

export function RecentsSection() {
  const { user } = useUser();
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [boards, setBoards] = React.useState<Board[]>([]);
  const [loading, setLoading] = React.useState(true);

  const userName = user?.fullName || user?.firstName || "You";

  // Fetch all boards created by authenticated user
  React.useEffect(() => {
    async function loadBoards() {
      try {
        const res = await axios.get("/api/board");
        if (res.data?.success && Array.isArray(res.data.data)) {
          setBoards(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch boards:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, []);

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
            className="size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setViewMode("grid")}
            title="Grid view"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-xs"
            className="size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => setViewMode("list")}
            title="List view"
          >
            <List className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-border/40 bg-muted/10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : boards.length === 0 ? (
        /* Empty State when no boards are present */
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dotted border-border/80 bg-muted/10 px-6 py-14 text-center transition-all">
          <div className="mb-3.5 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
            <FolderOpen className="size-6 text-muted-foreground" />
          </div>

          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            No boards yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            Create your first whiteboard to collaborate with your team, map ideas, and brainstorm together.
          </p>

          <Link href="/workspace">
            <Button
              size="sm"
              className="mt-4 h-8 gap-1.5 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-xs font-semibold px-3.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Create</span>
            </Button>
          </Link>
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
                <th className="pb-2.5 font-medium">Created / Opened</th>
                <th className="pb-2.5 font-medium">Owner</th>
                <th className="pb-2.5 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {boards.map((board) => {
                const dateStr = board.createdAt
                  ? new Date(board.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Recent";

                return (
                  <tr
                    key={board.id}
                    className="group hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <Link
                        href={`/workspace/${board.boardId}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                          <Layout className="size-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-foreground text-xs sm:text-sm truncate hover:underline">
                            {board.name || "Untitled"}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            ID: {board.boardId.slice(0, 8)}...
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">-</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">Personal</td>
                    <td className="py-3 text-muted-foreground">{dateStr}</td>
                    <td className="py-3 text-foreground/80 font-medium truncate max-w-[140px]">
                      {userName}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {boards.map((board) => {
            const dateStr = board.createdAt
              ? new Date(board.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            return (
              <Link
                key={board.id}
                href={`/workspace/${board.boardId}`}
                className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 hover:shadow-xs hover:border-foreground/20 transition-all cursor-pointer h-36"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <Layout className="size-4" />
                    </div>
                    <span className="font-semibold text-sm text-foreground truncate group-hover:underline">
                      {board.name || "Untitled"}
                    </span>
                  </div>
                  <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="flex flex-col text-[11px] text-muted-foreground gap-0.5">
                  <span>Owner: {userName}</span>
                  <span className="text-muted-foreground/80">Created {dateStr}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
