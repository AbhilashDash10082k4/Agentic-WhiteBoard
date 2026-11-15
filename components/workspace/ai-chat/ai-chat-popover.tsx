"use client";

import * as React from "react";
import {
  ChevronDown,
  SquarePen,
  MoreVertical,
  PanelRightClose,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIChatOptionsPanel } from "./ai-chat-options-panel";

interface AIChatPopoverProps {
  isOpen: boolean;
  activeSidekick: string;
  onSelectSidekick: (id: string) => void;
  onOpenSidePanel: () => void;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  onGenerateDiagram: (params: {
    diagramType: string;
    prompt: string;
    apiKey: string;
    provider: "gemini" | "openai";
  }) => void;
  isGenerating?: boolean;
}

export function AIChatPopover({
  isOpen,
  activeSidekick,
  onSelectSidekick,
  onOpenSidePanel,
  onClose,
  onSendMessage,
  onGenerateDiagram,
  isGenerating = false,
}: AIChatPopoverProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isArch = activeSidekick === "software-architecture";

  return (
    <div
      ref={popoverRef}
      data-ai-chat-container="true"
      className="fixed bottom-18 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-115 max-h-[82vh] flex flex-col rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 pb-2 relative border-b border-border/40">
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-foreground shadow-2xs transition-colors cursor-pointer"
        >
          <span>{isArch ? "Software Architecture" : "AI Helper"}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-13 left-3 z-50 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-xl animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                onSelectSidekick("general");
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              <SquarePen className="size-3.5" />
              <span>New chat</span>
            </button>
            <div className="my-1.5 h-px bg-border/60" />
            <div className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sidekicks
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectSidekick("software-architecture");
                setShowMenu(false);
              }}
              className={cn(
                "flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-muted text-foreground transition-colors cursor-pointer",
                isArch && "bg-muted",
              )}
            >
              <div className="flex size-5 items-center justify-center rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                S
              </div>
              <span>Software Architecture</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onSelectSidekick("general")}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="New chat"
          >
            <SquarePen className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowMenu((prev) => !prev)}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Options"
          >
            <MoreVertical className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={onOpenSidePanel}
            className="size-7 rounded-lg border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Open in side panel"
          >
            <PanelRightClose className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <AIChatOptionsPanel
          activeSidekick={activeSidekick}
          onSelectSidekick={onSelectSidekick}
          onSendMessage={onSendMessage}
          onGenerateDiagram={onGenerateDiagram}
          isGenerating={isGenerating}
        />
      </div>

      {/* Footer (Pic 3) */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/40 text-[10px] text-muted-foreground bg-muted/10">
        <span>AI generated content can be edited afterwards</span>
        <span className="flex items-center gap-1 font-medium">
          <Sparkles className="size-3 text-purple-500" />
          <span>AI</span>
        </span>
      </div>
    </div>
  );
}
