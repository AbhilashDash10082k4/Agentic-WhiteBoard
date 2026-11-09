"use client";

import * as React from "react";
import Link from "next/link";
import axios from "axios";
import { UserButton } from "@clerk/nextjs";
import {
  Menu,
  Smile,
  MoreVertical,
  Upload,
  ChevronDown,
  Timer,
  MessageSquare,
  Video,
  Play,
  Share2,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkspaceHeaderProps {
  boardId: string;
  initialName?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onTabChange?: (tab: string) => void;
}

export function WorkspaceHeader({
  boardId,
  initialName = "Untitled",
  isSidebarOpen,
  onToggleSidebar,
  onTabChange,
}: WorkspaceHeaderProps) {
  const [boardName, setBoardName] = React.useState(initialName);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [activeTab, setActiveTab] = React.useState<string>("whiteboard");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync initialName when loaded
  React.useEffect(() => {
    if (initialName) {
      setBoardName(initialName);
    }
  }, [initialName]);

  // Handle switching tabs and passing value to parent WorkspaceView
  const handleTabChange = (val: string | null) => {
    if (!val) return;
    setActiveTab(val);
    onTabChange?.(val);
  };

  // Save board name to DB via API endpoint
  const saveBoardName = async (newName: string) => {
    const trimmed = newName.trim() || "Untitled";
    setBoardName(trimmed);
    setSaveStatus("saving");

    try {
      await axios.post("/api/board", {
        boardId,
        name: trimmed,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to save board name:", error);
      setSaveStatus("idle");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      saveBoardName(boardName);
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <header className="fixed top-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-none">
      {/* Left controls: Sidebar toggle, Agentic WhiteBoard brand, Board name pill */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Toggle Sidebar Button */}
        <Button
          variant="outline"
          size="icon-sm"
          className="size-9 rounded-xl border-border/80 bg-background/95 backdrop-blur-md shadow-xs hover:bg-muted text-foreground cursor-pointer"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="size-4" />
        </Button>

        {/* Brand Logo pointing to dashboard */}
        <Link
          href="/dashboard"
          className="flex items-center gap-1 px-1 font-extrabold text-base tracking-tight text-foreground select-none cursor-pointer hover:opacity-85 transition-opacity"
        >
          <span>Agentic WhiteBoard</span>
        </Link>

        {/* Board Name & Meta Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md px-2.5 py-1 shadow-xs">
          <Smile className="size-4 text-muted-foreground shrink-0" />

          {/* Editable board name input/button */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={boardName}
              placeholder="Untitled"
              onChange={(e) => setBoardName(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                saveBoardName(boardName);
              }}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-6 w-32 sm:w-44 rounded-md bg-muted/60 px-1.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-ring"
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setTimeout(() => inputRef.current?.select(), 50);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:bg-muted/60 rounded px-1.5 py-0.5 transition-colors cursor-pointer max-w-[150px] sm:max-w-[200px] truncate"
              title="Click to rename board"
            >
              <span className="truncate">{boardName}</span>
              {saveStatus === "saving" && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              {saveStatus === "saved" && <Check className="size-3 text-emerald-500" />}
            </button>
          )}

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground cursor-pointer">
            <MoreVertical className="size-3.5" />
          </Button>

          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground cursor-pointer">
            <Upload className="size-3.5" />
          </Button>

          <button
            type="button"
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors cursor-pointer"
          >
            <span>Free plan</span>
            <ChevronDown className="size-2.5" />
          </button>
        </div>
      </div>

      {/* Center View Switcher: Whiteboard & Document (shadcn Tabs) */}
      <div className="pointer-events-auto flex items-center">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="gap-0"
        >
          <TabsList className="h-9 rounded-xl bg-background/95 border border-border/80 backdrop-blur-md p-1 shadow-xs">
            <TabsTrigger
              value="whiteboard"
              className="h-7 rounded-lg px-3.5 text-xs font-semibold data-active:bg-muted data-active:text-foreground cursor-pointer transition-colors"
            >
              Whiteboard
            </TabsTrigger>
            <TabsTrigger
              value="document"
              className="h-7 rounded-lg px-3.5 text-xs font-semibold data-active:bg-muted data-active:text-foreground cursor-pointer transition-colors"
            >
              Document
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Right controls: Timer, Reactions, Profile, Presentation, Share */}
      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md px-1.5 py-1 shadow-xs">
          <Button variant="ghost" size="icon-xs" className="size-7 text-muted-foreground hover:text-foreground cursor-pointer" title="Timer">
            <Timer className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7 text-muted-foreground hover:text-foreground cursor-pointer" title="Notes & Comments">
            <MessageSquare className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7 text-muted-foreground hover:text-foreground cursor-pointer" title="Video chat">
            <Video className="size-3.5" />
          </Button>
        </div>

        {/* Profile Button via Clerk */}
        <div className="flex items-center rounded-full ring-1 ring-border/80 bg-background shadow-xs p-0.5">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-7 cursor-pointer",
              },
            }}
          />
        </div>

        {/* Presentation Button */}
        <Button
          variant="outline"
          size="icon-sm"
          className="size-9 rounded-xl border-border/80 bg-background/95 backdrop-blur-md shadow-xs hover:bg-muted text-foreground cursor-pointer"
          title="Present"
        >
          <Play className="size-3.5 fill-current" />
        </Button>

        {/* Share Button */}
        <Button
          size="sm"
          className="h-9 gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-3.5 text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Share2 className="size-3.5" />
          <span>Share</span>
        </Button>

        {/* Theme Toggle */}
        <div className="rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-xs p-0.5">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
