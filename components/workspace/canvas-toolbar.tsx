"use client";

import * as React from "react";
import {
  Sparkles,
  MousePointer2,
  Hand,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  PenTool,
  Type,
  Eraser,
  Layout,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CanvasToolbarProps {
  excalidrawAPI?: any;
  activeTool?: string;
  onSelectTool?: (tool: string) => void;
}

export function CanvasToolbar({
  excalidrawAPI,
  activeTool = "selection",
  onSelectTool,
}: CanvasToolbarProps) {
  // Excalidraw tool definitions with custom vibrant colors
  const tools = [
    {
      id: "selection",
      label: "Select (V)",
      icon: MousePointer2,
      color: "text-sky-500",
      activeBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/40",
      hoverBg: "hover:bg-sky-500/10 hover:text-sky-500",
    },
    {
      id: "hand",
      label: "Hand Pan (H)",
      icon: Hand,
      color: "text-amber-500",
      activeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/40",
      hoverBg: "hover:bg-amber-500/10 hover:text-amber-500",
    },
    {
      id: "rectangle",
      label: "Rectangle (R)",
      icon: Square,
      color: "text-emerald-500",
      activeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/40",
      hoverBg: "hover:bg-emerald-500/10 hover:text-emerald-500",
    },
    {
      id: "diamond",
      label: "Diamond (D)",
      icon: Diamond,
      color: "text-teal-500",
      activeBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400 ring-1 ring-teal-500/40",
      hoverBg: "hover:bg-teal-500/10 hover:text-teal-500",
    },
    {
      id: "ellipse",
      label: "Ellipse (O)",
      icon: Circle,
      color: "text-purple-500",
      activeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/40",
      hoverBg: "hover:bg-purple-500/10 hover:text-purple-500",
    },
    {
      id: "arrow",
      label: "Arrow (A)",
      icon: ArrowRight,
      color: "text-orange-500",
      activeBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 ring-1 ring-orange-500/40",
      hoverBg: "hover:bg-orange-500/10 hover:text-orange-500",
    },
    {
      id: "line",
      label: "Line (L)",
      icon: Minus,
      color: "text-indigo-500",
      activeBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/40",
      hoverBg: "hover:bg-indigo-500/10 hover:text-indigo-500",
    },
    {
      id: "freedraw",
      label: "Draw (P)",
      icon: PenTool,
      color: "text-rose-500",
      activeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40",
      hoverBg: "hover:bg-rose-500/10 hover:text-rose-500",
    },
    {
      id: "text",
      label: "Text (T)",
      icon: Type,
      color: "text-blue-500",
      activeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/40",
      hoverBg: "hover:bg-blue-500/10 hover:text-blue-500",
    },
    {
      id: "eraser",
      label: "Eraser (E)",
      icon: Eraser,
      color: "text-red-500",
      activeBg: "bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/40",
      hoverBg: "hover:bg-red-500/10 hover:text-red-500",
    },
    {
      id: "frame",
      label: "Frame (F)",
      icon: Layout,
      color: "text-fuchsia-500",
      activeBg: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 ring-1 ring-fuchsia-500/40",
      hoverBg: "hover:bg-fuchsia-500/10 hover:text-fuchsia-500",
    },
  ];

  // Set active tool using Excalidraw Imperative API
  const handleSelect = (toolId: string) => {
    onSelectTool?.(toolId);
    if (excalidrawAPI) {
      excalidrawAPI.setActiveTool({ type: toolId });
    }
  };

  const handleUndo = () => {
    // 1. Try Excalidraw runtime actionManager
    try {
      const h = (window as any)?.h;
      if (h?.app?.actionManager?.actions?.undo) {
        h.app.actionManager.executeAction(h.app.actionManager.actions.undo);
        return;
      }
    } catch {
      // fallback
    }

    // 2. Click native Excalidraw undo button
    const undoButton = document.querySelector<HTMLButtonElement>(
      '.excalidraw button[aria-label="Undo"], .excalidraw [data-testid="undo-button"], .excalidraw .undo-redo-buttons button:first-child'
    );
    if (undoButton) {
      undoButton.click();
      return;
    }

    // 3. Fallback: targeted keyboard event to canvas
    const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas.interactive, .excalidraw");
    if (canvas) {
      canvas.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          bubbles: true,
        })
      );
    }
  };

  const handleRedo = () => {
    // 1. Try Excalidraw runtime actionManager
    try {
      const h = (window as any)?.h;
      if (h?.app?.actionManager?.actions?.redo) {
        h.app.actionManager.executeAction(h.app.actionManager.actions.redo);
        return;
      }
    } catch {
      // fallback
    }

    // 2. Click native Excalidraw redo button
    const redoButton = document.querySelector<HTMLButtonElement>(
      '.excalidraw button[aria-label="Redo"], .excalidraw [data-testid="redo-button"], .excalidraw .undo-redo-buttons button:last-child'
    );
    if (redoButton) {
      redoButton.click();
      return;
    }

    // 3. Fallback: targeted keyboard event to canvas
    const canvas = document.querySelector<HTMLCanvasElement>(".excalidraw canvas.interactive, .excalidraw");
    if (canvas) {
      canvas.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "y",
          code: "KeyY",
          ctrlKey: true,
          bubbles: true,
        })
      );
    }
  };

  return (
    <aside className="fixed left-3 top-20 z-20 flex flex-col items-center gap-1 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_14px_40px_rgba(0,0,0,0.5)] transition-shadow duration-200 hover:shadow-[0_16px_44px_rgba(0,0,0,0.16)] pointer-events-auto">
      {/* AI Assistant Highlight Button */}
      <Button
        size="icon-sm"
        className="size-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 shadow-xs mb-0.5 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="AI Helper"
      >
        <Sparkles className="size-4 fill-neutral-950" />
      </Button>

      {/* Main Toolset */}
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;

        return (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon-sm"
            onClick={() => handleSelect(tool.id)}
            className={cn(
              "size-8 rounded-xl transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer",
              isActive
                ? tool.activeBg
                : cn("text-muted-foreground", tool.hoverBg)
            )}
            title={tool.label}
          >
            <Icon className={cn("size-4", isActive ? "" : tool.color)} />
          </Button>
        );
      })}

      <div className="my-0.5 h-px w-5 bg-border/80" />

      {/* Undo & Redo Actions */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleUndo}
        className="size-8 rounded-xl text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleRedo}
        className="size-8 rounded-xl text-muted-foreground hover:bg-muted/70 hover:text-foreground hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="size-3.5" />
      </Button>
    </aside>
  );
}
