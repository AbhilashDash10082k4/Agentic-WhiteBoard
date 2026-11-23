"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { LayoutGrid, List, FolderOpen, Plus, Layout, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { type Board } from "@/db";
import { BoardActionMenu } from "./board-action-menu";

type BoardItem = Board & { updatedAt?: string | Date | null };

function formatBoardDate(dateVal?: string | Date | null): string {
  if (!dateVal) return "Today";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "Today";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface RecentsSectionProps {
  starredOnly?: boolean;
}

export function RecentsSection({ starredOnly = false }: RecentsSectionProps) {
  const router = useRouter();
  const { user } = useUser();
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");
  const [boards, setBoards] = React.useState<BoardItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const userName = user?.fullName || user?.firstName || "You";

  React.useEffect(() => {
    async function loadBoards() {
      try {
        const url = starredOnly ? "/api/board?starred=true" : "/api/board";
        const res = await axios.get(url);
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
  }, [starredOnly]);

  const handleRowClick = (boardId: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      !target ||
      target.closest("[data-no-nav]") ||
      target.closest("button") ||
      target.closest("[role='menuitem']") ||
      target.closest("[data-slot*='dropdown']") ||
      target.closest("dialog")
    ) {
      return;
    }
    router.push(`/workspace/${boardId}`);
  };

  const handleBoardUpdate = (updated: Board) => {
    setBoards((prev) => {
      if (starredOnly && !updated.isStarred) {
        return prev.filter((b) => b.boardId !== updated.boardId);
      }
      return prev.map((b) => (b.boardId === updated.boardId ? { ...b, ...updated } : b));
    });
  };

  const handleBoardDelete = (boardId: string) => {
    setBoards((prev) => prev.filter((b) => b.boardId !== boardId));
  };

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {starredOnly && <Star className="size-4 text-amber-500 fill-amber-400" />}
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
            {starredOnly ? "Starred Whiteboards" : "Jump back to recents"}
          </h2>
        </div>

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

      {loading ? (
        <div className="flex h-36 w-full items-center justify-center rounded-2xl border border-border/40 bg-muted/10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : boards.length === 0 ? (
        <div className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dotted border-border/80 bg-muted/10 px-6 py-14 text-center transition-all">
          <div className="mb-3.5 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground shadow-2xs">
            {starredOnly ? <Star className="size-6 text-amber-500" /> : <FolderOpen className="size-6 text-muted-foreground" />}
          </div>
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {starredOnly ? "No starred boards yet" : "No boards yet"}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            {starredOnly
              ? "Star your favorite whiteboard canvases from the recent list to access them quickly here."
              : "Create your first whiteboard to collaborate with your team, map ideas, and brainstorm together."}
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
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-medium">
                <th className="pb-2.5 font-medium min-w-50">Name</th>
                <th className="pb-2.5 font-medium hidden sm:table-cell">Online users</th>
                <th className="pb-2.5 font-medium hidden md:table-cell">Space</th>
                <th className="pb-2.5 font-medium">Created / Opened</th>
                <th className="pb-2.5 font-medium">Owner</th>
                <th className="pb-2.5 w-16 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {boards.map((board) => {
                const dateStr = formatBoardDate(board.updatedAt || board.createdAt);
                return (
                  <tr
                    key={board.id}
                    onClick={(e) => handleRowClick(board.boardId, e)}
                    className="group hover:bg-muted/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400">
                          <Layout className="size-3.5" />
                        </div>
                        <span className="font-semibold text-foreground text-xs sm:text-sm truncate group-hover:underline">
                          {board.name || "Untitled"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">-</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">Personal</td>
                    <td className="py-3 text-muted-foreground">{dateStr}</td>
                    <td className="py-3 text-foreground/80 font-medium truncate max-w-35">{userName}</td>
                    <td className="py-3 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                      <BoardActionMenu
                        board={board}
                        onUpdate={handleBoardUpdate}
                        onDelete={handleBoardDelete}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {boards.map((board) => {
            const dateStr = formatBoardDate(board.updatedAt || board.createdAt);
            return (
              <div
                key={board.id}
                onClick={(e) => handleRowClick(board.boardId, e)}
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
                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    <BoardActionMenu
                      board={board}
                      onUpdate={handleBoardUpdate}
                      onDelete={handleBoardDelete}
                    />
                  </div>
                </div>
                <div className="flex flex-col text-[11px] text-muted-foreground gap-0.5">
                  <span>Owner: {userName}</span>
                  <span className="text-muted-foreground/80">Created {dateStr}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
