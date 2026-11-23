/**
 * File: magnetic-connector-overlay.tsx
 * Description: Interactive magnetic connector handles and directional drag/click overlay for shapes on the whiteboard.
 * Connects to: Whiteboard.tsx, connector-geometry.ts, connector-binding-helper.ts, use-is-moving-element.ts
 */

"use client";

import * as React from "react";
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useIsMovingElement } from "../../hooks/use-is-moving-element";
import {
  Point,
  AnchorDirection,
  shouldSnap,
  getShapeBorderAnchors,
  getDirectionalConnectionPoints,
} from "./connector-geometry";
import {
  createDirectionalGhostConnection,
  createSnappedArrowConnection,
  createCustomDragConnection,
} from "./connector-binding-helper";

export type { Point, AnchorDirection };
export { shouldSnap, getShapeBorderAnchors };

interface MagneticConnectorOverlayProps {
  selectedElement: any | null;
  excalidrawAPI: any;
  viewport: { scrollX: number; scrollY: number; zoom: number };
}

/**
 * Function: MagneticConnectorOverlay
 * Description: Renders directional anchor handles and ghost previews on selected canvas shapes, handling click and drag creation.
 * Connects to: Whiteboard.tsx
 */
export function MagneticConnectorOverlay({
  selectedElement,
  excalidrawAPI,
  viewport,
}: MagneticConnectorOverlayProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const isMovingHook = useIsMovingElement(excalidrawAPI);

  const [hoveredDir, setHoveredDir] = React.useState<AnchorDirection | null>(
    null,
  );
  const isCreatingRef = React.useRef(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimeout = React.useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnterDir = React.useCallback(
    (dir: AnchorDirection) => {
      clearHoverTimeout();
      setHoveredDir(dir);
    },
    [clearHoverTimeout],
  );

  const handleMouseLeaveDir = React.useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDir(null);
    }, 250);
  }, [clearHoverTimeout]);

  React.useEffect(() => {
    return () => clearHoverTimeout();
  }, [clearHoverTimeout]);

  const [activeDrag, setActiveDrag] = React.useState<{
    sourceAnchor: AnchorDirection;
    sourcePoint: Point;
    currentPointer: Point;
    hasDragged: boolean;
    startClient: Point;
  } | null>(null);

  const [snappedTarget, setSnappedTarget] = React.useState<{
    element: any;
    direction: AnchorDirection;
    point: Point;
  } | null>(null);

  const liveAppState = excalidrawAPI?.getAppState?.();
  const liveElements = excalidrawAPI?.getSceneElements?.() || [];
  const selectedIds = Object.keys(
    liveAppState?.selectedElementIds || {},
  ).filter((id) => liveAppState?.selectedElementIds[id]);
  const liveEl =
    selectedIds.length === 1
      ? liveElements.find(
          (el: any) => el.id === selectedIds[0] && !el.isDeleted,
        )
      : null;

  const currentElement = liveEl || selectedElement;
  const isDraggingCanvas =
    !!liveAppState?.draggingElement || !!liveAppState?.resizingElement;

  const isShape =
    currentElement &&
    ["rectangle", "diamond", "ellipse"].includes(currentElement.type) &&
    !currentElement.isDeleted;

  const zoom = liveAppState?.zoom?.value ?? viewport.zoom;
  const scrollX = liveAppState?.scrollX ?? viewport.scrollX;
  const scrollY = liveAppState?.scrollY ?? viewport.scrollY;

  const toScreen = React.useCallback(
    (scenePt: Point): Point => ({
      x: (scenePt.x + scrollX) * zoom,
      y: (scenePt.y + scrollY) * zoom,
    }),
    [scrollX, scrollY, zoom],
  );

  const toScene = React.useCallback(
    (clientPt: Point): Point => {
      const rect = containerRef.current?.getBoundingClientRect();
      const canvasX = clientPt.x - (rect?.left ?? 0);
      const canvasY = clientPt.y - (rect?.top ?? 0);
      return {
        x: canvasX / zoom - scrollX,
        y: canvasY / zoom - scrollY,
      };
    },
    [scrollX, scrollY, zoom],
  );

  const handleCreateDirectional = async (dir: AnchorDirection) => {
    if (isCreatingRef.current) return;
    if (!currentElement || !excalidrawAPI) return;
    isCreatingRef.current = true;
    try {
      const currentElements =
        excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
      const themeMode = resolvedTheme === "dark" ? "dark" : "light";
      const { elements: updatedElements, newShapeId } =
        await createDirectionalGhostConnection(
          currentElement,
          dir,
          currentElements,
          themeMode,
        );

      excalidrawAPI.updateScene({
        elements: updatedElements,
        appState: { selectedElementIds: { [newShapeId]: true } },
      });

      setHoveredDir(null);
      const childText = (updatedElements || []).find(
        (c: any) => c?.type === "text" && c?.containerId === newShapeId,
      );
      if (childText) {
        setTimeout(() => {
          excalidrawAPI.updateScene({
            appState: {
              editingElement: childText,
              selectedElementIds: { [newShapeId]: true },
            },
          });
        }, 50);
      }
    } finally {
      isCreatingRef.current = false;
    }
  };

  const handlePointerDown = (dir: AnchorDirection, e: React.PointerEvent) => {
    e.stopPropagation();
    clearHoverTimeout();
    const borderAnchors = getShapeBorderAnchors(currentElement);
    setActiveDrag({
      sourceAnchor: dir,
      sourcePoint: borderAnchors[dir],
      currentPointer: toScene({ x: e.clientX, y: e.clientY }),
      hasDragged: false,
      startClient: { x: e.clientX, y: e.clientY },
    });
  };

  React.useEffect(() => {
    if (!activeDrag || !excalidrawAPI) return;

    const onPointerMove = (e: PointerEvent) => {
      const dist = Math.hypot(
        e.clientX - activeDrag.startClient.x,
        e.clientY - activeDrag.startClient.y,
      );
      const isDragging = dist > 5;
      const scenePtr = toScene({ x: e.clientX, y: e.clientY });

      let foundSnap: {
        element: any;
        direction: AnchorDirection;
        point: Point;
      } | null = null;
      let minDistance = Infinity;

      if (isDragging) {
        const elements = excalidrawAPI.getSceneElements?.() || [];
        for (const el of elements) {
          if (el.id === currentElement?.id || el.isDeleted) continue;
          if (!["rectangle", "diamond", "ellipse"].includes(el.type)) continue;

          const targetAnchors = getShapeBorderAnchors(el);
          for (const [dir, pt] of Object.entries(targetAnchors)) {
            if (shouldSnap(scenePtr, pt, 24)) {
              const d = Math.hypot(scenePtr.x - pt.x, scenePtr.y - pt.y);
              if (d < minDistance) {
                minDistance = d;
                foundSnap = {
                  element: el,
                  direction: dir as AnchorDirection,
                  point: pt,
                };
              }
            }
          }
        }
      }

      setSnappedTarget(foundSnap);
      setActiveDrag((prev) =>
        prev
          ? { ...prev, currentPointer: scenePtr, hasDragged: isDragging }
          : null,
      );
    };

    const onPointerUp = async () => {
      clearHoverTimeout();
      const wasDragged = activeDrag.hasDragged;
      const sourceAnchor = activeDrag.sourceAnchor;
      const sourcePt = activeDrag.sourcePoint;
      const currentPtr = activeDrag.currentPointer;
      const snap = snappedTarget;

      setActiveDrag(null);
      setSnappedTarget(null);
      setHoveredDir(null);

      if (!wasDragged) {
        await handleCreateDirectional(sourceAnchor);
      } else {
        const currentElements =
          excalidrawAPI.getSceneElementsIncludingDeleted?.() || [];
        if (snap) {
          const updatedElements = await createSnappedArrowConnection(
            currentElement,
            snap.element,
            sourcePt,
            snap.point,
            currentElements,
          );
          excalidrawAPI.updateScene({ elements: updatedElements });
        } else {
          const themeMode = resolvedTheme === "dark" ? "dark" : "light";
          const { elements: updatedElements, newShapeId } =
            await createCustomDragConnection(
              currentElement,
              sourcePt,
              currentPtr,
              currentElements,
              themeMode,
            );
          excalidrawAPI.updateScene({
            elements: updatedElements,
            appState: { selectedElementIds: { [newShapeId]: true } },
          });

          const childText = (updatedElements || []).find(
            (c: any) => c?.type === "text" && c?.containerId === newShapeId,
          );
          if (childText) {
            setTimeout(() => {
              excalidrawAPI.updateScene({
                appState: {
                  editingElement: childText,
                  selectedElementIds: { [newShapeId]: true },
                },
              });
            }, 50);
          }
        }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    activeDrag,
    snappedTarget,
    currentElement,
    excalidrawAPI,
    toScene,
    resolvedTheme,
    clearHoverTimeout,
  ]);

  if (!isShape || isMovingHook || isDraggingCanvas) return null;

  const sx = Math.min(
    currentElement.x ?? 0,
    (currentElement.x ?? 0) + (currentElement.width ?? 0),
  );
  const sy = Math.min(
    currentElement.y ?? 0,
    (currentElement.y ?? 0) + (currentElement.height ?? 0),
  );
  const sw = Math.abs(currentElement.width ?? 0);
  const sh = Math.abs(currentElement.height ?? 0);
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;

  const handleOffset = 14;
  const handles: { direction: AnchorDirection; scene: Point }[] = [
    { direction: "top", scene: { x: cx, y: sy - handleOffset } },
    { direction: "bottom", scene: { x: cx, y: sy + sh + handleOffset } },
    { direction: "left", scene: { x: sx - handleOffset, y: cy } },
    { direction: "right", scene: { x: sx + sw + handleOffset, y: cy } },
  ];

  const strokeColor =
    currentElement?.strokeColor ||
    (resolvedTheme === "dark" ? "#F8E0A4" : "#1F150C");
  const hoverPreview =
    hoveredDir && !activeDrag?.hasDragged
      ? getDirectionalConnectionPoints(currentElement, hoveredDir)
      : null;

  const renderDirIcon = (dir: AnchorDirection) => {
    const iconClass = "size-3.5 text-white dark:text-[#010736]";
    switch (dir) {
      case "right":
        return <ArrowRight className={iconClass} />;
      case "left":
        return <ArrowLeft className={iconClass} />;
      case "top":
        return <ArrowUp className={iconClass} />;
      case "bottom":
        return <ArrowDown className={iconClass} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-20 overflow-visible"
    >
      {/* Directional Hover Preview */}
      {hoverPreview && hoveredDir && (
        <>
          <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
            <defs>
              <marker
                id="hover-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill={strokeColor} />
              </marker>
            </defs>
            <line
              x1={toScreen(hoverPreview.sourcePoint).x}
              y1={toScreen(hoverPreview.sourcePoint).y}
              x2={toScreen(hoverPreview.targetPoint).x}
              y2={toScreen(hoverPreview.targetPoint).y}
              stroke={strokeColor}
              strokeWidth={2}
              markerEnd="url(#hover-arrowhead)"
            />
            <line
              data-magnetic-handle="true"
              x1={toScreen(hoverPreview.sourcePoint).x}
              y1={toScreen(hoverPreview.sourcePoint).y}
              x2={toScreen(hoverPreview.targetPoint).x}
              y2={toScreen(hoverPreview.targetPoint).y}
              stroke="transparent"
              strokeWidth={36}
              className="pointer-events-auto cursor-pointer"
              onMouseEnter={() => handleMouseEnterDir(hoveredDir)}
              onMouseLeave={handleMouseLeaveDir}
              onPointerDown={(e) => handlePointerDown(hoveredDir, e)}
            />
          </svg>
          <div
            data-magnetic-handle="true"
            style={{
              width: hoverPreview.targetShape.width * zoom,
              height: hoverPreview.targetShape.height * zoom,
              left: `${toScreen({ x: hoverPreview.targetShape.x, y: hoverPreview.targetShape.y }).x}px`,
              top: `${toScreen({ x: hoverPreview.targetShape.x, y: hoverPreview.targetShape.y }).y}px`,
            }}
            className={cn(
              "absolute flex items-center justify-center border-2 border-dashed border-[#22396F] dark:border-[#F8E0A4] bg-[#22396F]/15 dark:bg-[#F8E0A4]/15 shadow-sm transition-transform cursor-pointer pointer-events-auto hover:bg-[#22396F]/25 dark:hover:bg-[#F8E0A4]/25 hover:scale-[1.02]",
              currentElement.type === "ellipse"
                ? "rounded-full"
                : currentElement.type === "diamond"
                  ? "rotate-45"
                  : "rounded-2xl",
            )}
            onMouseEnter={() => handleMouseEnterDir(hoveredDir)}
            onMouseLeave={handleMouseLeaveDir}
            onPointerDown={(e) => handlePointerDown(hoveredDir, e)}
          >
            <span
              className={cn(
                "text-xs font-semibold text-[#22396F] dark:text-[#F8E0A4] select-none",
                currentElement.type === "diamond" ? "-rotate-45" : "",
              )}
            >
              Text
            </span>
          </div>
        </>
      )}

      {/* Connection Handles */}
      {(!activeDrag || !activeDrag.hasDragged) &&
        handles.map((h) => {
          const screenPt = toScreen(h.scene);
          const isHovered = hoveredDir === h.direction;
          return (
            <div
              key={h.direction}
              data-magnetic-handle="true"
              style={{ left: `${screenPt.x}px`, top: `${screenPt.y}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              onMouseEnter={() => handleMouseEnterDir(h.direction)}
              onMouseLeave={handleMouseLeaveDir}
            >
              <button
                type="button"
                data-magnetic-handle="true"
                onPointerDown={(e) => handlePointerDown(h.direction, e)}
                title={`Connect from ${h.direction}`}
                className={cn(
                  "rounded-full bg-[#22396F] dark:bg-[#F8E0A4] border-2 border-white dark:border-[#010736] shadow-md cursor-pointer flex items-center justify-center transition-all duration-150",
                  isHovered
                    ? "size-6 ring-4 ring-[#22396F]/30 dark:ring-[#F8E0A4]/40 scale-110"
                    : "size-3.5 hover:scale-125",
                )}
              >
                {isHovered && renderDirIcon(h.direction)}
              </button>
            </div>
          );
        })}

      {/* Free Drag Preview */}
      {activeDrag?.hasDragged && (
        <>
          <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
            <defs>
              <marker
                id="drag-arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <polygon points="0 1, 8 4, 0 7" fill={strokeColor} />
              </marker>
            </defs>
            <line
              x1={toScreen(activeDrag.sourcePoint).x}
              y1={toScreen(activeDrag.sourcePoint).y}
              x2={
                toScreen(
                  snappedTarget
                    ? snappedTarget.point
                    : activeDrag.currentPointer,
                ).x
              }
              y2={
                toScreen(
                  snappedTarget
                    ? snappedTarget.point
                    : activeDrag.currentPointer,
                ).y
              }
              stroke={strokeColor}
              strokeWidth={2}
              strokeDasharray={snappedTarget ? "none" : "4,4"}
              markerEnd="url(#drag-arrowhead)"
            />
          </svg>
          {snappedTarget ? (
            <div
              data-magnetic-handle="true"
              style={{
                left: `${toScreen(snappedTarget.point).x}px`,
                top: `${toScreen(snappedTarget.point).y}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-2 border-emerald-500 bg-emerald-500/20 ring-4 ring-emerald-500/40 animate-pulse pointer-events-none"
            />
          ) : (
            <div
              data-magnetic-handle="true"
              style={{
                width: Math.abs(currentElement.width || 140) * zoom,
                height: Math.abs(currentElement.height || 70) * zoom,
                left: `${toScreen(activeDrag.currentPointer).x}px`,
                top: `${toScreen(activeDrag.currentPointer).y}px`,
              }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-2 border-dashed border-[#22396F] dark:border-[#F8E0A4] bg-[#22396F]/15 dark:bg-[#F8E0A4]/15 pointer-events-none shadow-lg text-xs font-semibold text-[#22396F] dark:text-[#F8E0A4]",
                currentElement.type === "ellipse"
                  ? "rounded-full"
                  : currentElement.type === "diamond"
                    ? "rotate-45"
                    : "rounded-2xl",
              )}
            >
              <span
                className={cn(
                  currentElement.type === "diamond" ? "-rotate-45" : "",
                )}
              >
                Text
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
