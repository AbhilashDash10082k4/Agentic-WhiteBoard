"use client";

import * as React from "react";
import {
  GripVertical,
  Palette,
  Droplet,
  Copy,
  Lock,
  Unlock,
  Trash2,
  MoreHorizontal,
  X,
  BringToFront,
  SendToBack,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingToolBarProps {
  selectedElement: any | null;
  position: { x: number; y: number } | null;
  excalidrawAPI: any;
  onClose?: () => void;
}

const PALETTE_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#9c36b5",
];

export function FloatingToolBar({
  selectedElement,
  position,
  excalidrawAPI,
  onClose,
}: FloatingToolBarProps) {
  const [showOptions, setShowOptions] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState<
    "stroke" | "fill" | null
  >(null);

  if (!selectedElement || !position) return null;

  const isText = selectedElement.type === "text";
  const isLine =
    selectedElement.type === "line" || selectedElement.type === "arrow";

  // Apply updates to the currently selected element in Excalidraw scene
  const updateElement = (updates: Record<string, any>) => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted();
    const updated = all.map((el: any) => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          ...updates,
          version: el.version + 1,
          versionNonce: Math.floor(Math.random() * 1000000),
        };
      }
      return el;
    });
    excalidrawAPI.updateScene({ elements: updated });
  };

  const handleDuplicate = () => {
    if (!excalidrawAPI) return;
    const clone = {
      ...selectedElement,
      id: crypto.randomUUID(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
    };
    excalidrawAPI.updateScene({
      elements: [...excalidrawAPI.getSceneElementsIncludingDeleted(), clone],
    });
  };

  const handleDelete = () => {
    updateElement({ isDeleted: true });
    onClose?.();
  };

  const handleBringToFront = () => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted();
    const target = all.find((el: any) => el.id === selectedElement.id);
    const rest = all.filter((el: any) => el.id !== selectedElement.id);
    if (target) excalidrawAPI.updateScene({ elements: [...rest, target] });
  };

  const handleSendToBack = () => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted();
    const target = all.find((el: any) => el.id === selectedElement.id);
    const rest = all.filter((el: any) => el.id !== selectedElement.id);
    if (target) excalidrawAPI.updateScene({ elements: [target, ...rest] });
  };

  const renderTypeIcon = () => {
    switch (selectedElement.type) {
      case "text":
        return <Type className="size-4 text-blue-500" />;
      case "ellipse":
        return <Circle className="size-4 text-purple-500" />;
      case "diamond":
        return <Diamond className="size-4 text-teal-500" />;
      case "arrow":
        return <ArrowRight className="size-4 text-orange-500" />;
      case "line":
        return <Minus className="size-4 text-indigo-500" />;
      default:
        return <Square className="size-4 text-emerald-500" />;
    }
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-30 transition-all duration-75 pointer-events-auto select-none"
    >
      {/* Main Floating Pill Bar */}
      <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/95 backdrop-blur-md px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <GripVertical className="size-3.5 text-muted-foreground/60 cursor-grab" />
        <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
          {renderTypeIcon()}
        </div>

        {/* Stroke Color Picker Trigger */}
        <button
          type="button"
          onClick={() =>
            setShowColorPicker(showColorPicker === "stroke" ? null : "stroke")
          }
          className="relative size-7 rounded-lg hover:bg-muted flex flex-col items-center justify-center cursor-pointer"
          title="Stroke Color"
        >
          <Palette className="size-3.5 text-foreground" />
          <span
            className="h-1 w-3.5 rounded-full mt-0.5"
            style={{
              backgroundColor: selectedElement.strokeColor || "#1e1e1e",
            }}
          />
        </button>

        {/* Fill Color Picker Trigger */}
        {!isLine && (
          <button
            type="button"
            onClick={() =>
              setShowColorPicker(showColorPicker === "fill" ? null : "fill")
            }
            className="relative size-7 rounded-lg hover:bg-muted flex flex-col items-center justify-center cursor-pointer"
            title="Fill Color"
          >
            <Droplet className="size-3.5 text-foreground" />
            <span
              className="h-1 w-3.5 rounded-full mt-0.5 border border-border/40"
              style={{
                backgroundColor:
                  selectedElement.backgroundColor === "transparent"
                    ? "white"
                    : selectedElement.backgroundColor || "transparent",
              }}
            />
          </button>
        )}

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDuplicate}
          className="size-7 rounded-lg cursor-pointer"
          title="Duplicate"
        >
          <Copy className="size-3.5 text-muted-foreground hover:text-foreground" />
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => updateElement({ locked: !selectedElement.locked })}
          className="size-7 rounded-lg cursor-pointer"
          title={selectedElement.locked ? "Unlock" : "Lock"}
        >
          {selectedElement.locked ? (
            <Lock className="size-3.5 text-amber-500" />
          ) : (
            <Unlock className="size-3.5 text-muted-foreground" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-xs"
          onClick={handleDelete}
          className="size-7 rounded-lg hover:bg-red-500/10 cursor-pointer"
          title="Delete"
        >
          <Trash2 className="size-3.5 text-red-500" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        <Button
          variant={showOptions ? "secondary" : "ghost"}
          size="icon-xs"
          onClick={() => setShowOptions(!showOptions)}
          className="size-7 rounded-lg cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="size-3.5" />
        </Button>
      </div>

      {/* Quick Color Palette Popover */}
      {showColorPicker && (
        <div className="absolute top-12 left-6 z-40 flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md p-2 shadow-lg animate-in fade-in">
          {PALETTE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                if (showColorPicker === "stroke")
                  updateElement({ strokeColor: c });
                else updateElement({ backgroundColor: c });
                setShowColorPicker(null);
              }}
              style={{ backgroundColor: c }}
              className="size-5 rounded-full border border-black/10 transition-transform hover:scale-125 cursor-pointer"
            />
          ))}
          <button
            type="button"
            onClick={() => {
              if (showColorPicker === "fill")
                updateElement({ backgroundColor: "transparent" });
              setShowColorPicker(null);
            }}
            className="size-5 rounded-full border border-border/80 bg-muted flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
            title="Transparent"
          >
            ✕
          </button>
        </div>
      )}

      {/* Extended Options Card (Shape options / Text options) */}
      {showOptions && (
        <div className="absolute top-12 left-0 z-40 w-72 rounded-2xl border border-border/80 bg-background/98 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <span className="text-xs font-bold text-foreground">
              {isText ? "Text options" : "Shape options"}
            </span>
            <button
              onClick={() => setShowOptions(false)}
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
              onClick={handleBringToFront}
              className="h-8 gap-1.5 text-xs rounded-xl cursor-pointer"
            >
              <BringToFront className="size-3" />
              <span>Bring front</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendToBack}
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
                      onClick={() => updateElement({ fontFamily: f.val })}
                      className={cn(
                        "h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                        selectedElement.fontFamily === f.val
                          ? "bg-background text-foreground shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground",
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
                    onChange={(e) =>
                      updateElement({ fontSize: Number(e.target.value) })
                    }
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
                        onClick={() => updateElement({ textAlign: a.val })}
                        className={cn(
                          "flex-1 h-6 flex items-center justify-center rounded-md cursor-pointer",
                          selectedElement.textAlign === a.val
                            ? "bg-background shadow-xs text-foreground"
                            : "text-muted-foreground",
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
                      onClick={() => updateElement({ strokeStyle: s.val })}
                      className={cn(
                        "h-7 rounded-lg text-xs font-semibold cursor-pointer",
                        selectedElement.strokeStyle === s.val
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
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
                  onChange={(e) =>
                    updateElement({ strokeWidth: Number(e.target.value) })
                  }
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
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    if (isText) updateElement({ strokeColor: c });
                    else
                      updateElement({ backgroundColor: c, fillStyle: "solid" });
                  }}
                  style={{ backgroundColor: c }}
                  className="size-6 rounded-full border border-black/10 transition-transform hover:scale-125 cursor-pointer"
                />
              ))}
              {!isText && (
                <button
                  type="button"
                  onClick={() =>
                    updateElement({ backgroundColor: "transparent" })
                  }
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
              onChange={(e) =>
                updateElement({ opacity: Number(e.target.value) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
