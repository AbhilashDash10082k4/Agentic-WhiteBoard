"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedUpgradeButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "default" | "full";
  showIcon?: boolean;
}

// Upgrade button with rotating animated warm golden gradient border
export function AnimatedUpgradeButton({
  className,
  size = "default",
  showIcon = false,
  children = "Upgrade",
  ...props
}: AnimatedUpgradeButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-lg p-[1px] font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none group shadow-xs shrink-0 cursor-pointer",
        size === "full" ? "w-full" : "w-auto",
        className
      )}
      {...props}
    >
      {/* Rotating continuous warm golden conic gradient border */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[-1000%] animate-border-rotate bg-[conic-gradient(from_90deg_at_50%_50%,#eab308_0%,#f59e0b_25%,#fde047_50%,#d97706_75%,#eab308_100%)]"
      />

      {/* Solid inner surface perfectly filling container without gaps */}
      <span
        className={cn(
          "relative z-10 flex size-full items-center justify-center gap-1.5 rounded-[calc(var(--radius)-1px)] bg-background font-semibold text-foreground transition-colors group-hover:bg-muted/90 active:scale-[0.98]",
          size === "sm" && "h-7 text-xs px-2.5",
          size === "default" && "h-8 text-xs px-3",
          size === "full" && "h-8 text-xs px-3.5"
        )}
      >
        {showIcon && (
          <Sparkles className="size-3 text-amber-500 dark:text-amber-400 shrink-0" />
        )}
        <span>{children}</span>
      </span>
    </button>
  );
}
