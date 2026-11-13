"use client";

import * as React from "react";
import {
  GraduationCap,
  Network,
  Presentation,
  X,
  Plus,
  Mic,
  Minus,
  Maximize2,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CanvasBottomBarProps {
  zoom?: number;
  isSidebarOpen?: boolean;
  isChatOpen?: boolean;
  onOpenChat?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

export function CanvasBottomBar({
  zoom = 100,
  isSidebarOpen = false,
  isChatOpen = false,
  onOpenChat,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: CanvasBottomBarProps) {
  const [showPills, setShowPills] = React.useState(true);
  const [promptText, setPromptText] = React.useState("");

  return (
    <footer
      className={cn(
        "fixed bottom-3 right-0 z-30 pointer-events-none flex items-end justify-between px-4 transition-all duration-200",
        isSidebarOpen ? "left-64" : "left-0"
      )}
    >
      {/* Spacer on left */}
      <div className="w-16 hidden md:block" />

      {/* Center AI prompt & suggested quick actions */}
      <div className="flex flex-col items-center gap-2 pointer-events-auto max-w-lg w-full mx-auto">
        {/* Suggestion Pills */}
        {showPills && !isChatOpen && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 transition-all animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors cursor-pointer"
            >
              <GraduationCap className="size-3.5 text-blue-500" />
              <span>Learn Miro AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors cursor-pointer"
            >
              <Network className="size-3.5 text-orange-500" />
              <span>Map a process</span>
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/95 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground hover:bg-muted shadow-xs transition-colors cursor-pointer"
            >
              <Presentation className="size-3.5 text-yellow-500" />
              <span>Prep a workshop</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPills(false)}
              className="flex size-6 items-center justify-center rounded-full border border-border/80 bg-background/95 text-muted-foreground hover:text-foreground shadow-xs cursor-pointer"
              title="Dismiss suggestions"
            >
              <X className="size-3" />
            </button>
          </div>
        )}

        {/* Floating Prompt Bar */}
        {!isChatOpen && (
          <div
            onClick={onOpenChat}
            className="flex h-10 w-full items-center gap-2 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md px-3 shadow-md hover:border-foreground/25 transition-all cursor-pointer"
          >
            <Plus className="size-4 text-muted-foreground shrink-0 cursor-pointer hover:text-foreground" />
            <input
              type="text"
              readOnly
              placeholder="Where shall we start?"
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium cursor-pointer"
            />
            <button
              type="button"
              className="size-7 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer hover:bg-muted"
              title="Voice prompt"
            >
              <Mic className="size-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right Zoom Controls */}
      <div className="flex items-center gap-1 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md px-1.5 py-1 shadow-md pointer-events-auto">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onResetZoom}
          className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
          title="Fit to view"
        >
          <Maximize2 className="size-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onZoomOut}
          className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
          title="Zoom out (-)"
        >
          <Minus className="size-3.5" />
        </Button>

        <button
          type="button"
          onClick={onResetZoom}
          className="px-1 text-xs font-semibold tabular-nums text-foreground hover:bg-muted rounded py-0.5 cursor-pointer"
          title="Reset zoom"
        >
          {zoom}%
        </button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onZoomIn}
          className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
          title="Zoom in (+)"
        >
          <Plus className="size-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        <Button
          variant="ghost"
          size="icon-xs"
          className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
          title="Help & resources"
        >
          <HelpCircle className="size-3.5" />
        </Button>
      </div>
    </footer>
  );
}

