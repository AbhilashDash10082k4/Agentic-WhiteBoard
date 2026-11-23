"use client";

import * as React from "react";
import axios from "axios";
import { MoreHorizontal, Star, Edit2, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { type Board } from "@/db";

interface BoardActionMenuProps {
  board: Board;
  onUpdate: (updated: Board) => void;
  onDelete: (boardId: string) => void;
}

export function BoardActionMenu({
  board,
  onUpdate,
  onDelete,
}: BoardActionMenuProps) {
  const [isRenameOpen, setIsRenameOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [newName, setNewName] = React.useState(board.name || "Untitled");
  const [isRenaming, setIsRenaming] = React.useState(false);

  // Toggle star status optimistically
  const handleToggleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const nextStarred = !board.isStarred;
    onUpdate({ ...board, isStarred: nextStarred });
    try {
      await axios.patch("/api/board", {
        boardId: board.boardId,
        isStarred: nextStarred,
      });
      toast({ title: nextStarred ? "Starred board" : "Removed from starred" });
    } catch {
      onUpdate(board); // Revert on failure
      toast({ title: "Failed to update star", variant: "destructive" });
    }
  };

  // Copy workspace share link
  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/workspace/${board.boardId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Link copied to clipboard", description: shareUrl });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive" });
    }
  };

  // Submit board rename
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsRenaming(true);
    const prevName = board.name;
    onUpdate({ ...board, name: newName.trim() });
    setIsRenameOpen(false);
    try {
      await axios.patch("/api/board", {
        boardId: board.boardId,
        name: newName.trim(),
      });
      toast({ title: "Board renamed" });
    } catch {
      onUpdate({ ...board, name: prevName }); // Revert
      toast({ title: "Failed to rename board", variant: "destructive" });
    } finally {
      setIsRenaming(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    onDelete(board.boardId);
    try {
      await axios.delete(`/api/board?boardId=${board.boardId}`);
      toast({ title: "Board deleted successfully" });
    } catch {
      toast({ title: "Failed to delete board", variant: "destructive" });
    }
  };

  return (
    <div
      data-no-nav="true"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex items-center gap-1 shrink-0"
    >
      {/* Star Button */}
      <Button
        variant="ghost"
        size="icon-xs"
        className="size-7 text-muted-foreground hover:text-amber-500 cursor-pointer"
        onClick={handleToggleStar}
        title={board.isStarred ? "Unstar board" : "Star board"}
      >
        <Star
          className={`size-3.5 transition-colors ${
            board.isStarred ? "fill-amber-400 text-amber-500" : ""
          }`}
        />
      </Button>

      {/* 3 Dots Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors outline-none"
          title="More actions"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 text-xs font-medium">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setNewName(board.name || "");
              setIsRenameOpen(true);
            }}
            className="cursor-pointer gap-2"
          >
            <Edit2 className="size-3.5" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleCopyLink();
            }}
            className="cursor-pointer gap-2"
          >
            <Share2 className="size-3.5" />
            <span>Share (Copy link)</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteOpen(true);
            }}
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Whiteboard</DialogTitle>
            <DialogDescription>
              Enter a new title for this whiteboard canvas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Board title..."
              autoFocus
              className="text-sm"
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isRenaming || !newName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Delete Whiteboard
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {board.name || "Untitled"}
              </span>
              ? This canvas and all elements will be removed permanently.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
            >
              Delete Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
