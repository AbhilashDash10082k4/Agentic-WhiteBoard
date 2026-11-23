/**
 * File: FloatingToolBar.tsx
 * Description: Floating context toolbar positioned above selected element for quick styling, coloring, duplication, deletion, and text styling options.
 * Connects to: Whiteboard.tsx, floating-toolbar-options.tsx, floating-text-options.tsx, text-container-helper.ts, fractional-index-helper.ts
 */

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
  Type,
  Square,
  Circle,
  Diamond,
  ArrowRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingToolbarOptions } from "./floating-toolbar-options";
import { FloatingTextOptions } from "./floating-text-options";
import { ensureShapeTextContainer } from "./text-container-helper";
import { repairFractionalIndicesAndBindings } from "./fractional-index-helper";

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

/**
 * Function: FloatingToolBar
 * Description: Renders context toolbar over selected canvas element with stroke, fill, text style popovers, and layer management.
 * Connects to: Whiteboard.tsx
 */
export function FloatingToolBar({
  selectedElement,
  position,
  excalidrawAPI,
  onClose,
}: FloatingToolBarProps) {
  const [showOptions, setShowOptions] = React.useState(false);
  const [showTextOptions, setShowTextOptions] = React.useState(false);
  const [showColorPicker, setShowColorPicker] = React.useState<
    "stroke" | "fill" | null
  >(null);

  if (!selectedElement || !position) return null;

  const isLine =
    selectedElement.type === "line" || selectedElement.type === "arrow";
  const canHaveText = ["text", "rectangle", "diamond", "ellipse"].includes(
    selectedElement.type,
  );

  const getBoundText = (): any | null => {
    if (!excalidrawAPI || !selectedElement) return null;
    if (selectedElement.type === "text") return selectedElement;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
    return (
      all.find(
        (el: any) =>
          el?.type === "text" &&
          el?.containerId === selectedElement.id &&
          !el?.isDeleted,
      ) || null
    );
  };

  const boundText = getBoundText();
  const currentFontFamily =
    boundText?.fontFamily ?? selectedElement.fontFamily ?? 1;
  const currentFontSize = boundText?.fontSize ?? selectedElement.fontSize ?? 20;
  const currentTextAlign =
    boundText?.textAlign ?? selectedElement.textAlign ?? "center";

  const updateElement = (updates: Record<string, any>) => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted();
    const boundTextId = selectedElement.boundElements?.find(
      (b: any) => b.type === "text",
    )?.id;
    const updated = all.map((el: any) => {
      if (el.id === selectedElement.id) {
        return {
          ...el,
          ...updates,
          version: el.version + 1,
          versionNonce: Math.floor(Math.random() * 1000000),
        };
      }
      if (updates.isDeleted && boundTextId && el.id === boundTextId) {
        return {
          ...el,
          isDeleted: true,
          version: el.version + 1,
          versionNonce: Math.floor(Math.random() * 1000000),
        };
      }
      return el;
    });
    excalidrawAPI.updateScene({
      elements: repairFractionalIndicesAndBindings(updated),
    });
  };

  const handleUpdateTextStyle = async (updates: Record<string, any>) => {
    if (!excalidrawAPI || !selectedElement) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];

    if (selectedElement.type === "text") {
      const updated = all.map((el: any) => {
        if (el.id === selectedElement.id) {
          return {
            ...el,
            ...updates,
            version: (el.version || 0) + 1,
            versionNonce: Math.floor(Math.random() * 2000000000),
          };
        }
        return el;
      });
      excalidrawAPI.updateScene({
        elements: repairFractionalIndicesAndBindings(updated),
      });
      return;
    }

    let targetText = all.find(
      (el: any) =>
        el?.type === "text" &&
        el?.containerId === selectedElement.id &&
        !el?.isDeleted,
    );

    if (!targetText) {
      targetText = await ensureShapeTextContainer(
        selectedElement,
        excalidrawAPI,
        "Text",
      );
    }

    if (targetText) {
      const currentAll =
        excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
      const updated = currentAll.map((el: any) => {
        if (el.id === targetText.id) {
          return {
            ...el,
            ...updates,
            version: (el.version || 0) + 1,
            versionNonce: Math.floor(Math.random() * 2000000000),
          };
        }
        if (el.id === selectedElement.id) {
          return {
            ...el,
            version: (el.version || 0) + 1,
            versionNonce: Math.floor(Math.random() * 2000000000),
          };
        }
        return el;
      });
      excalidrawAPI.updateScene({
        elements: repairFractionalIndicesAndBindings(updated),
      });
    }
  };

  const handleEditText = async () => {
    await ensureShapeTextContainer(selectedElement, excalidrawAPI);
    setShowTextOptions(false);
  };

  const handleDuplicate = () => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
    const bText = all.find(
      (el: any) =>
        el?.type === "text" &&
        el?.containerId === selectedElement.id &&
        !el?.isDeleted,
    );

    const newShapeId = crypto.randomUUID();
    const clonedShape = {
      ...selectedElement,
      id: newShapeId,
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
      boundElements: [],
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000),
    };

    let newItems = [clonedShape];

    if (bText) {
      const newTextId = crypto.randomUUID();
      clonedShape.boundElements = [{ id: newTextId, type: "text" }];
      const clonedText = {
        ...bText,
        id: newTextId,
        containerId: newShapeId,
        x: bText.x + 20,
        y: bText.y + 20,
        version: 1,
        versionNonce: Math.floor(Math.random() * 1000000),
      };
      newItems = [clonedShape, clonedText];
    }

    const updated = repairFractionalIndicesAndBindings([...all, ...newItems]);
    excalidrawAPI.updateScene({
      elements: updated,
      appState: { selectedElementIds: { [newShapeId]: true } },
    });
  };

  const handleDelete = () => {
    updateElement({ isDeleted: true });
    onClose?.();
  };

  const handleBringToFront = () => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
    const target = all.find((el: any) => el?.id === selectedElement.id);
    if (!target) return;
    const bText = all.find(
      (el: any) =>
        el?.type === "text" && el?.containerId === target.id && !el?.isDeleted,
    );
    const movedIds = new Set([target.id, ...(bText ? [bText.id] : [])]);
    const rest = all.filter((el: any) => !movedIds.has(el?.id));
    const updated = repairFractionalIndicesAndBindings([
      ...rest,
      target,
      ...(bText ? [bText] : []),
    ]);
    excalidrawAPI.updateScene({ elements: updated });
  };

  const handleSendToBack = () => {
    if (!excalidrawAPI) return;
    const all = excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
    const target = all.find((el: any) => el?.id === selectedElement.id);
    if (!target) return;
    const bText = all.find(
      (el: any) =>
        el?.type === "text" && el?.containerId === target.id && !el?.isDeleted,
    );
    const movedIds = new Set([target.id, ...(bText ? [bText.id] : [])]);
    const rest = all.filter((el: any) => !movedIds.has(el?.id));
    const updated = repairFractionalIndicesAndBindings([
      target,
      ...(bText ? [bText] : []),
      ...rest,
    ]);
    excalidrawAPI.updateScene({ elements: updated });
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
      className="fixed z-30 -translate-x-1/2 transition-all duration-75 pointer-events-auto select-none"
    >
      {/* Main Floating Pill Bar */}
      <div className="flex items-center gap-1 rounded-full border border-border/80 bg-background/95 backdrop-blur-md px-2.5 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <GripVertical className="size-3.5 text-muted-foreground/60 cursor-grab" />
        <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
          {renderTypeIcon()}
        </div>

        {/* Stroke Color Picker */}
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(showColorPicker === "stroke" ? null : "stroke");
            setShowTextOptions(false);
            setShowOptions(false);
          }}
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

        {/* Fill Color Picker */}
        {!isLine && (
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(showColorPicker === "fill" ? null : "fill");
              setShowTextOptions(false);
              setShowOptions(false);
            }}
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

        {/* Text Style / Edit Trigger */}
        {canHaveText && (
          <Button
            variant={showTextOptions ? "secondary" : "ghost"}
            size="icon-xs"
            onClick={() => {
              setShowTextOptions((prev) => !prev);
              setShowColorPicker(null);
              setShowOptions(false);
            }}
            className="size-7 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 cursor-pointer"
            title="Text & Font Style"
          >
            <Type className="size-3.5" />
          </Button>
        )}

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
          onClick={() => {
            setShowOptions(!showOptions);
            setShowTextOptions(false);
            setShowColorPicker(null);
          }}
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

      {/* Text Style Options Card */}
      {showTextOptions && (
        <FloatingTextOptions
          currentFontFamily={currentFontFamily}
          currentFontSize={currentFontSize}
          currentTextAlign={currentTextAlign}
          onUpdateTextStyle={handleUpdateTextStyle}
          onEditText={handleEditText}
          onClose={() => setShowTextOptions(false)}
        />
      )}

      {/* Extended Options Card */}
      {showOptions && (
        <FloatingToolbarOptions
          selectedElement={selectedElement}
          paletteColors={PALETTE_COLORS}
          onUpdateElement={updateElement}
          onBringToFront={handleBringToFront}
          onSendToBack={handleSendToBack}
          onClose={() => setShowOptions(false)}
        />
      )}
    </div>
  );
}
