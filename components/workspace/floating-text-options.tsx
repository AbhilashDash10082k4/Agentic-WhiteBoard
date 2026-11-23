/**
 * File: floating-text-options.tsx
 * Description: Popover panel for editing element text styles (font family, font size, alignment, and inline edit trigger).
 * Connects to: FloatingToolBar.tsx
 */

"use client";

import * as React from "react";
import { X, AlignLeft, AlignCenter, AlignRight, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingTextOptionsProps {
  currentFontFamily: number;
  currentFontSize: number;
  currentTextAlign: string;
  onUpdateTextStyle: (updates: Record<string, any>) => void;
  onEditText: () => void;
  onClose: () => void;
}

const FONT_FAMILIES = [
  { label: "Hand", val: 1 },
  { label: "Normal", val: 2 },
  { label: "Code", val: 3 },
];

const FONT_SIZES = [
  { label: "16 S", val: 16 },
  { label: "20 M", val: 20 },
  { label: "28 L", val: 28 },
  { label: "36 XL", val: 36 },
];

const ALIGNMENTS = [
  { icon: AlignLeft, val: "left" },
  { icon: AlignCenter, val: "center" },
  { icon: AlignRight, val: "right" },
];

/**
 * Function: FloatingTextOptions
 * Description: Renders text styling popover offering font family, font size, alignment, and edit trigger.
 * Connects to: FloatingToolBar.tsx
 */
export function FloatingTextOptions({
  currentFontFamily,
  currentFontSize,
  currentTextAlign,
  onUpdateTextStyle,
  onEditText,
  onClose,
}: FloatingTextOptionsProps) {
  return (
    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-40 w-64 rounded-2xl border border-border/80 bg-background/98 backdrop-blur-xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-top-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <span className="text-xs font-bold text-foreground">Text style</span>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Font Family */}
      <div className="pt-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
          Font Family
        </span>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
          {FONT_FAMILIES.map((f) => (
            <button
              key={f.val}
              type="button"
              onClick={() => onUpdateTextStyle({ fontFamily: f.val })}
              className={cn(
                "h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                currentFontFamily === f.val
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="pt-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
          Font Size
        </span>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1">
          {FONT_SIZES.map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => onUpdateTextStyle({ fontSize: s.val })}
              className={cn(
                "h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                currentFontSize === s.val
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment */}
      <div className="pt-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
          Alignment
        </span>
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
          {ALIGNMENTS.map((a) => (
            <button
              key={a.val}
              type="button"
              onClick={() => onUpdateTextStyle({ textAlign: a.val })}
              className={cn(
                "flex-1 h-6 flex items-center justify-center rounded-md cursor-pointer transition-colors",
                currentTextAlign === a.val
                  ? "bg-background shadow-xs text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <a.icon className="size-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Edit Content Action */}
      <div className="pt-3 mt-2 border-t border-border/60">
        <Button
          variant="outline"
          size="sm"
          onClick={onEditText}
          className="w-full h-7 gap-1.5 text-xs rounded-xl cursor-pointer"
        >
          <Type className="size-3 text-blue-500" />
          <span>Edit text content</span>
        </Button>
      </div>
    </div>
  );
}
