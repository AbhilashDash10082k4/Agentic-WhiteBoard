"use client";

import * as React from "react";
import {
  ChevronDown,
  SquarePen,
  MoreVertical,
  PanelRightClose,
  Mic,
  Plus,
  ArrowUp,
  X,
  GraduationCap,
  Network,
  Presentation,
  HardDrive,
  MessageSquare,
  PenTool,
  GitBranch,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SOLVING_OPTIONS,
  CREATION_OPTIONS,
  SOFTWARE_ARCHITECTURE_SIDEKICK,
  Sidekick,
  SolvingOption,
  CreationOption,
} from "./ai-chat-types";

interface AIChatPopoverProps {
  isOpen: boolean;
  activeSidekick: string;
  onSelectSidekick: (id: string) => void;
  onOpenSidePanel: () => void;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export function AIChatPopover({
  isOpen,
  activeSidekick,
  onSelectSidekick,
  onOpenSidePanel,
  onClose,
  onSendMessage,
}: AIChatPopoverProps) {
  const [inputText, setInputText] = React.useState("");
  const [showMenu, setShowMenu] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isArch = activeSidekick === "software-architecture";

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const renderSolvingIcon = (name: SolvingOption["iconName"]) => {
    switch (name) {
      case "GraduationCap": return <GraduationCap className="size-4" />;
      case "Network": return <Network className="size-4" />;
      case "Presentation": return <Presentation className="size-4" />;
      case "HardDrive": return <HardDrive className="size-4" />;
      case "MessageSquare": return <MessageSquare className="size-4" />;
    }
  };

  const renderCreationIcon = (name: CreationOption["iconName"]) => {
    switch (name) {
      case "PenTool": return <PenTool className="size-4" />;
      case "GitBranch": return <GitBranch className="size-4" />;
      case "Network": return <Network className="size-4" />;
      case "Monitor": return <Monitor className="size-4" />;
      case "Smartphone": return <Smartphone className="size-4" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-18 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-[460px] max-h-[82vh] flex flex-col rounded-3xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 pb-2 relative border-b border-border/40">
        <button
          type="button"
          onClick={() => setShowMenu((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-foreground shadow-2xs transition-colors cursor-pointer"
        >
          <span>{isArch ? "Software Architecture" : "Untitled chat"}</span>
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
                isArch && "bg-muted"
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
            onClick={() => {
              onSelectSidekick("general");
              setInputText("");
            }}
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
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground md:hidden"
            title="Close"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {isArch ? (
          /* Software Architecture Sidekick View (Pic 2) */
          <div className="flex flex-col items-center text-center pt-2 pb-1 space-y-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xl font-bold shadow-xs">
              S
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">
                Software Architecture
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
                {SOFTWARE_ARCHITECTURE_SIDEKICK.description}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 w-full pt-1">
              {SOFTWARE_ARCHITECTURE_SIDEKICK.promptChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setInputText(chip);
                    onSendMessage(chip);
                  }}
                  className="rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-4 py-1.5 text-xs font-medium text-foreground text-center transition-colors cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Default "What are we solving today?" View (Pic 1 & Pic 5) */
          <>
            <div>
              <h3 className="text-sm font-semibold text-foreground tracking-tight mb-2">
                What are we solving today?
              </h3>
              <div className="space-y-1">
                {SOLVING_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "map-process") {
                        onSelectSidekick("software-architecture");
                      } else {
                        onSendMessage(item.title);
                      }
                    }}
                    className="flex items-center gap-3 w-full p-1.5 rounded-xl hover:bg-muted/60 text-left transition-colors cursor-pointer"
                  >
                    <div className={cn("flex size-7 items-center justify-center rounded-full", item.badgeBg, item.color)}>
                      {renderSolvingIcon(item.iconName)}
                    </div>
                    <span className="text-xs font-medium text-foreground">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* "WHAT DO YOU WANT TO CREATE?" (Pic 5) */}
            <div className="pt-2 border-t border-border/40">
              <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                What do you want to create?
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {CREATION_OPTIONS.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (card.id === "architecture") {
                        onSelectSidekick("software-architecture");
                      } else {
                        onSendMessage(`Create ${card.title}: ${card.description}`);
                      }
                    }}
                    className="relative flex items-start gap-2.5 p-2.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 hover:border-border transition-all text-left cursor-pointer shadow-2xs"
                  >
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-xl", card.badgeBg)}>
                      {renderCreationIcon(card.iconName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-foreground truncate">{card.title}</div>
                      <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {card.description}
                      </div>
                    </div>
                    {card.badgeIndicator && (
                      <span className="absolute top-2 right-2 size-1.5 rounded-full bg-purple-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Input Area (Pic 1 / Pic 2) */}
      <div className="p-3 pt-1 border-t border-border/40">
        <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2 shadow-xs focus-within:ring-1 focus-within:ring-ring">
          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground">
            <Plus className="size-4" />
          </Button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isArch ? SOFTWARE_ARCHITECTURE_SIDEKICK.promptPlaceholder : "Where shall we start?"}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground">
            <Mic className="size-3.5" />
          </Button>
          {inputText.trim() && (
            <Button
              size="icon-xs"
              onClick={handleSend}
              className="size-6 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90"
            >
              <ArrowUp className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

