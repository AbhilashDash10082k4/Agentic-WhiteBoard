"use client";

import * as React from "react";
import {
  ChevronDown,
  SquarePen,
  MoreVertical,
  PanelRightClose,
  X,
  Plus,
  Mic,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessage, SOFTWARE_ARCHITECTURE_SIDEKICK } from "./ai-chat-types";

interface AIChatSidebarProps {
  isOpen: boolean;
  messages: ChatMessage[];
  activeSidekick: string;
  onSelectSidekick: (id: string) => void;
  onRestorePopover: () => void;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export function AIChatSidebar({
  isOpen,
  messages,
  activeSidekick,
  onSelectSidekick,
  onRestorePopover,
  onClose,
  onSendMessage,
}: AIChatSidebarProps) {
  const [inputText, setInputText] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const isArch = activeSidekick === "software-architecture";

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <aside className="fixed top-0 right-0 z-40 h-screen w-full sm:w-[420px] flex flex-col border-l border-border bg-background text-foreground shadow-2xl transition-all duration-200 animate-in slide-in-from-right">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/60 relative">
        <button
          type="button"
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-foreground shadow-2xs transition-colors cursor-pointer max-w-[220px]"
        >
          <span className="truncate">
            {isArch ? "Software Architecture" : "Design a scalable..."}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </button>

        {showDropdown && (
          <div className="absolute top-12 left-3 z-50 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-xl animate-in fade-in">
            <button
              type="button"
              onClick={() => {
                onSelectSidekick("general");
                setShowDropdown(false);
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
                setShowDropdown(false);
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

        {/* Right Action Icons (Pic 4) */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onSendMessage("New chat initialized")}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="New chat"
          >
            <SquarePen className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowDropdown((prev) => !prev)}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="More options"
          >
            <MoreVertical className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onRestorePopover}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Restore to floating popup"
          >
            <PanelRightClose className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Close panel"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1 rounded-2xl p-3.5",
              msg.role === "user"
                ? "bg-muted/70 ml-6 text-foreground"
                : "bg-card border border-border/70 text-foreground shadow-2xs mr-2"
            )}
          >
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                {msg.role === "assistant" && (
                  <Sparkles className="size-3 text-amber-500 fill-amber-500" />
                )}
                {msg.role === "user" ? "You" : isArch ? "Software Architecture" : "Agentic AI"}
              </span>
              <span>
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="whitespace-pre-wrap mt-1 leading-normal text-xs font-normal">
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Prompt Input (Pic 4) */}
      <div className="p-3 border-t border-border/60 bg-background/90 backdrop-blur-md">
        <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-background px-3 py-2 shadow-xs focus-within:ring-1 focus-within:ring-ring">
          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground shrink-0">
            <Plus className="size-4" />
          </Button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="What shall we do next?"
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          <Button variant="ghost" size="icon-xs" className="size-6 text-muted-foreground hover:text-foreground shrink-0">
            <Mic className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="size-6 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-40"
          >
            <ArrowUp className="size-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

