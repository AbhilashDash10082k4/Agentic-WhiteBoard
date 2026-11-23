/**
 * File: floating-toolbar-options.tsx
 * Description: Popover menu rendering secondary element properties (stroke style, roughness, opacity, layers).
 * Connects to: FloatingToolBar.tsx
 */

"use client";

import * as React from "react";
import {
  X,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingToolbarOptionsProps {
  selectedElement: any;
  paletteColors: string[];
  onUpdateElement: (updates: Record<string, any>) => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onClose: () => void;
}

/**
 * Function: FloatingToolbarOptions
 * Description: Renders extended property adjustments including layer controls, opacity, roughness, and stroke styles.
 * Connects to: FloatingToolBar.tsx
 */
export function FloatingToolbarOptions({
  selectedElement,
  paletteColors,
  onUpdateElement,
  onBringToFront,
  onSendToBack,
  onClose,
}: FloatingToolbarOptionsProps) {
  const isText = selectedElement.type === "text";

  return (
    <div className="absolute top-12 left-0 z-50 w-72 rounded-2xl border border-border/80 bg-background/98 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <span className="text-xs font-bold text-foreground">
          {isText ? "Text options" : "Shape options"}
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Layer Arrangement */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onBringToFront}
          className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer"
        >
          <BringToFront className="size-3" />
          <span>Bring front</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onSendToBack}
          className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer"
        >
          <SendToBack className="size-3" />
          <span>Send back</span>
        </Button>
      </div>

      {/* TEXT SPECIFIC CONTROLS */}
      {isText && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Font
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
              {[
                { label: "Hand", val: 1 },
                { label: "Normal", val: 2 },
                { label: "Mono", val: 3 },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => onUpdateElement({ fontFamily: f.val })}
                  className={cn(
                    "h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                    selectedElement.fontFamily === f.val
                      ? "bg-background text-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                Size
              </span>
              <select
                value={selectedElement.fontSize || 20}
                onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) })}
                className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-medium cursor-pointer"
              >
                <option value={16}>16 px — Small</option>
                <option value={20}>20 px — Medium</option>
                <option value={28}>28 px — Large</option>
                <option value={36}>36 px — XL</option>
              </select>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                Alignment
              </span>
              <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
                {[
                  { icon: AlignLeft, val: "left" },
                  { icon: AlignCenter, val: "center" },
                  { icon: AlignRight, val: "right" },
                ].map((a) => (
                  <button
                    key={a.val}
                    onClick={() => onUpdateElement({ textAlign: a.val })}
                    className={cn(
                      "flex-1 h-6 flex items-center justify-center rounded-md cursor-pointer",
                      selectedElement.textAlign === a.val
                        ? "bg-background shadow-xs text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <a.icon className="size-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHAPE SPECIFIC CONTROLS */}
      {!isText && (
        <div className="flex flex-col gap-3 pt-2 border-t border-border/60">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Stroke Style
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
              {[
                { label: "—", val: "solid" },
                { label: "- - -", val: "dashed" },
                { label: "···", val: "dotted" },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => onUpdateElement({ strokeStyle: s.val })}
                  className={cn(
                    "h-7 rounded-lg text-xs font-semibold cursor-pointer",
                    selectedElement.strokeStyle === s.val
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Width
            </span>
            <select
              value={selectedElement.strokeWidth || 2}
              onChange={(e) => onUpdateElement({ strokeWidth: Number(e.target.value) })}
              className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs font-medium cursor-pointer"
            >
              <option value={1}>1 px — Thin</option>
              <option value={2}>2 px — Medium</option>
              <option value={4}>4 px — Bold</option>
              <option value={8}>8 px — Extra Bold</option>
            </select>
          </div>
        </div>
      )}

      {/* Color Palette Dots */}
      <div className="pt-3 border-t border-border/60">
        <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
          {isText ? "Text color" : "Fill"}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {paletteColors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                if (isText) onUpdateElement({ strokeColor: c });
                else onUpdateElement({ backgroundColor: c, fillStyle: "solid" });
              }}
              style={{ backgroundColor: c }}
              className="size-6 rounded-full border border-black/10 transition-transform hover:scale-125 cursor-pointer"
            />
          ))}
          {!isText && (
            <button
              type="button"
              onClick={() => onUpdateElement({ backgroundColor: "transparent" })}
              className="size-6 rounded-full border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Transparent"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="pt-3 border-t border-border/60">
        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mb-1">
          <span>Opacity</span>
          <span>{selectedElement.opacity ?? 100}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={selectedElement.opacity ?? 100}
          onChange={(e) => onUpdateElement({ opacity: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>
    </div>
  );
}

