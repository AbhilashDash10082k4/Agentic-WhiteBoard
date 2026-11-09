"use client";

import * as React from "react";
import {
  Sparkles,
  MousePointer2,
  StickyNote,
  Square,
  Layout,
  Type,
  Workflow,
  PenTool,
  Plus,
  Undo2,
  Redo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CanvasToolbar() {
  const [activeTool, setActiveTool] = React.useState<string>("select");

  const tools = [
    { id: "select", icon: MousePointer2, label: "Select (V)" },
    { id: "sticky", icon: StickyNote, label: "Sticky note (N)" },
    { id: "shape", icon: Square, label: "Shapes (S)" },
    { id: "frame", icon: Layout, label: "Frame (F)" },
    { id: "text", icon: Type, label: "Text (T)" },
    { id: "connector", icon: Workflow, label: "Connection line (L)" },
    { id: "pen", icon: PenTool, label: "Pen (P)" },
    { id: "more", icon: Plus, label: "More tools" },
  ];

  return (
    <aside className="fixed left-3 top-20 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md p-1.5 shadow-md">
      {/* Miro AI Assistant Highlight Button */}
      <Button
        size="icon-sm"
        className="size-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-neutral-950 shadow-xs mb-0.5"
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
            variant={isActive ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setActiveTool(tool.id)}
            className={`size-8 rounded-xl transition-colors ${
              isActive
                ? "bg-muted text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            }`}
            title={tool.label}
          >
            <Icon className="size-4" />
          </Button>
        );
      })}

      <div className="my-1 h-px w-5 bg-border/80" />

      {/* Undo & Redo Actions */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="size-8 rounded-xl text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        className="size-8 rounded-xl text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="size-3.5" />
      </Button>
    </aside>
  );
}
