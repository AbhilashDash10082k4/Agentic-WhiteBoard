/**
 * File: connector-binding-helper.ts
 * Description: Creation and binding of directional shapes, snapped arrows, and free drag connected shapes.
 * Connects to: connector-geometry.ts, magnetic-connector-overlay.tsx, ai-canvas-generator.ts, fractional-index-helper.ts
 */

import { convertToElements } from "./ai-chat/ai-canvas-generator";
import { repairFractionalIndicesAndBindings } from "./fractional-index-helper";
import {
  Point,
  AnchorDirection,
  getDirectionalConnectionPoints,
  normalizeLinearPoints,
} from "./connector-geometry";

export type { Point, AnchorDirection };
export { getDirectionalConnectionPoints, normalizeLinearPoints };

/**
 * Function: createDirectionalGhostConnection
 * Description: Manifests a solid connected shape and arrow in a given cardinal direction from source element.
 * Connects to: magnetic-connector-overlay.tsx
 */
export async function createDirectionalGhostConnection(
  sourceEl: any,
  dir: AnchorDirection,
  currentElements: readonly any[],
  theme: "light" | "dark" = "light",
) {
  const { sourcePoint, targetPoint, targetShape } =
    getDirectionalConnectionPoints(sourceEl, dir);
  const newShapeId = `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const arrowId = `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const defaultStroke = theme === "dark" ? "#F8E0A4" : "#1F150C";
  const strokeColor = sourceEl.strokeColor || defaultStroke;

  const sourceBoundText = (currentElements || []).find(
    (el: any) =>
      el?.type === "text" &&
      el?.containerId === sourceEl.id &&
      !el?.isDeleted,
  );

  const newShapeSkeleton = {
    type: sourceEl.type || "rectangle",
    id: newShapeId,
    x: targetShape.x,
    y: targetShape.y,
    width: targetShape.width,
    height: targetShape.height,
    strokeColor,
    backgroundColor: sourceEl.backgroundColor || "transparent",
    fillStyle: sourceEl.fillStyle || "solid",
    strokeWidth: sourceEl.strokeWidth || 2,
    strokeStyle: sourceEl.strokeStyle || "solid",
    roughness: sourceEl.roughness ?? 1,
    roundness: sourceEl.roundness || { type: 3 },
    groupIds: [],
    boundElements: [{ id: arrowId, type: "arrow" }],
    label: {
      text: "Text",
      fontSize: sourceBoundText?.fontSize || 16,
      fontFamily: sourceBoundText?.fontFamily || 1,
      textAlign: sourceBoundText?.textAlign || "center",
      verticalAlign: "middle",
    },
  };

  const arrowSkeleton = {
    type: "arrow",
    id: arrowId,
    x: sourcePoint.x,
    y: sourcePoint.y,
    points: [
      [0, 0],
      [targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y],
    ],
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: newShapeId, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
    strokeWidth: sourceEl.strokeWidth || 2,
    groupIds: [],
    boundElements: [],
  };

  const converted = await convertToElements(
    [newShapeSkeleton, arrowSkeleton],
    { regenerateIds: false },
  );

  const convShape =
    converted.find((c: any) => c.id === newShapeId) ||
    converted.find((c: any) => c.type !== "arrow" && c.type !== "text");
  const actualShapeId = convShape?.id || newShapeId;

  const convArrowRaw =
    converted.find((c: any) => c.id === arrowId) ||
    converted.find((c: any) => c.type === "arrow") ||
    arrowSkeleton;
  const actualArrowId = convArrowRaw?.id || arrowId;

  const convText =
    converted.find(
      (c: any) =>
        c.type === "text" &&
        (c.containerId === actualShapeId || c.containerId === newShapeId),
    ) || converted.find((c: any) => c.type === "text");
  const actualTextId = convText?.id;

  if (convShape) {
    convShape.id = actualShapeId;
    const existing = (convShape.boundElements || []).filter(
      (b: any) => b.id !== actualArrowId,
    );
    convShape.boundElements = [
      ...existing,
      { id: actualArrowId, type: "arrow" },
      ...(actualTextId && !existing.some((b: any) => b.id === actualTextId)
        ? [{ id: actualTextId, type: "text" }]
        : []),
    ];
    convShape.groupIds = Array.isArray(convShape.groupIds)
      ? convShape.groupIds
      : [];
  }

  if (convText) {
    convText.containerId = actualShapeId;
  }

  const convArrow = normalizeLinearPoints({
    groupIds: [],
    boundElements: [],
    ...convArrowRaw,
    id: actualArrowId,
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: actualShapeId, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
  });

  const updatedSource = {
    ...sourceEl,
    boundElements: [
      ...(sourceEl.boundElements || []).filter(
        (b: any) => b.id !== actualArrowId,
      ),
      { id: actualArrowId, type: "arrow" },
    ],
    version: (sourceEl.version || 0) + 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
  };

  const updatedElements = currentElements.map((el: any) =>
    el.id === sourceEl.id ? updatedSource : el,
  );
  const newElements = [
    convShape,
    ...(convText ? [convText] : []),
    convArrow,
  ].filter(Boolean);

  return {
    elements: repairFractionalIndicesAndBindings([
      ...updatedElements,
      ...newElements,
    ]),
    newShapeId: actualShapeId,
  };
}

/**
 * Function: createSnappedArrowConnection
 * Description: Binds an arrow between two existing shapes with start and end bindings.
 * Connects to: magnetic-connector-overlay.tsx
 */
export async function createSnappedArrowConnection(
  sourceEl: any,
  targetEl: any,
  sourcePoint: Point,
  targetPoint: Point,
  currentElements: readonly any[],
) {
  const arrowId = `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const strokeColor = sourceEl.strokeColor || "#1e1e1e";

  const updatedSource = {
    ...sourceEl,
    boundElements: [
      ...(sourceEl.boundElements || []).filter((b: any) => b.id !== arrowId),
      { id: arrowId, type: "arrow" },
    ],
    version: (sourceEl.version || 0) + 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
  };

  const updatedTarget = {
    ...targetEl,
    boundElements: [
      ...(targetEl.boundElements || []).filter((b: any) => b.id !== arrowId),
      { id: arrowId, type: "arrow" },
    ],
    version: (targetEl.version || 0) + 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
  };

  const arrowSkeleton = {
    type: "arrow",
    id: arrowId,
    x: sourcePoint.x,
    y: sourcePoint.y,
    points: [
      [0, 0],
      [targetPoint.x - sourcePoint.x, targetPoint.y - sourcePoint.y],
    ],
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: targetEl.id, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
    strokeWidth: sourceEl.strokeWidth || 2,
    groupIds: [],
    boundElements: [],
  };

  const converted = await convertToElements([arrowSkeleton], {
    regenerateIds: false,
  });
  const rawArrow =
    converted.find((c: any) => c.id === arrowId) ||
    converted.find((c: any) => c.type === "arrow") ||
    arrowSkeleton;

  const finalArrow = normalizeLinearPoints({
    groupIds: [],
    boundElements: [],
    ...rawArrow,
    id: rawArrow.id || arrowId,
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: targetEl.id, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
  });

  const updatedElements = currentElements.map((el: any) => {
    if (el.id === sourceEl.id) return updatedSource;
    if (el.id === targetEl.id) return updatedTarget;
    return el;
  });

  return repairFractionalIndicesAndBindings([...updatedElements, finalArrow]);
}

/**
 * Function: createCustomDragConnection
 * Description: Manifests a connected shape and arrow at an arbitrary pointer drop location.
 * Connects to: magnetic-connector-overlay.tsx
 */
export async function createCustomDragConnection(
  sourceEl: any,
  sourcePoint: Point,
  dropPoint: Point,
  currentElements: readonly any[],
  theme: "light" | "dark" = "light",
) {
  const ghostW = Math.abs(sourceEl.width || 140);
  const ghostH = Math.abs(sourceEl.height || 70);
  const targetX = Math.round(dropPoint.x - ghostW / 2);
  const targetY = Math.round(dropPoint.y - ghostH / 2);
  const newShapeId = `shape-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const arrowId = `arrow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const defaultStroke = theme === "dark" ? "#F8E0A4" : "#1F150C";
  const strokeColor = sourceEl.strokeColor || defaultStroke;

  const sourceBoundText = (currentElements || []).find(
    (el: any) =>
      el?.type === "text" &&
      el?.containerId === sourceEl.id &&
      !el?.isDeleted,
  );

  const newShapeSkeleton = {
    type: sourceEl.type || "rectangle",
    id: newShapeId,
    x: targetX,
    y: targetY,
    width: ghostW,
    height: ghostH,
    strokeColor,
    backgroundColor: sourceEl.backgroundColor || "transparent",
    fillStyle: sourceEl.fillStyle || "solid",
    strokeWidth: sourceEl.strokeWidth || 2,
    strokeStyle: sourceEl.strokeStyle || "solid",
    roughness: sourceEl.roughness ?? 1,
    roundness: sourceEl.roundness || { type: 3 },
    groupIds: [],
    boundElements: [{ id: arrowId, type: "arrow" }],
    label: {
      text: "Text",
      fontSize: sourceBoundText?.fontSize || 16,
      fontFamily: sourceBoundText?.fontFamily || 1,
      textAlign: sourceBoundText?.textAlign || "center",
      verticalAlign: "middle",
    },
  };

  const arrowSkeleton = {
    type: "arrow",
    id: arrowId,
    x: sourcePoint.x,
    y: sourcePoint.y,
    points: [
      [0, 0],
      [dropPoint.x - sourcePoint.x, dropPoint.y - sourcePoint.y],
    ],
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: newShapeId, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
    strokeWidth: sourceEl.strokeWidth || 2,
    groupIds: [],
    boundElements: [],
  };

  const converted = await convertToElements(
    [newShapeSkeleton, arrowSkeleton],
    { regenerateIds: false },
  );

  const convShape =
    converted.find((c: any) => c.id === newShapeId) ||
    converted.find((c: any) => c.type !== "arrow" && c.type !== "text");
  const actualShapeId = convShape?.id || newShapeId;

  const convArrowRaw =
    converted.find((c: any) => c.id === arrowId) ||
    converted.find((c: any) => c.type === "arrow") ||
    arrowSkeleton;
  const actualArrowId = convArrowRaw?.id || arrowId;

  const convText =
    converted.find(
      (c: any) =>
        c.type === "text" &&
        (c.containerId === actualShapeId || c.containerId === newShapeId),
    ) || converted.find((c: any) => c.type === "text");
  const actualTextId = convText?.id;

  if (convShape) {
    convShape.id = actualShapeId;
    const existing = (convShape.boundElements || []).filter(
      (b: any) => b.id !== actualArrowId,
    );
    convShape.boundElements = [
      ...existing,
      { id: actualArrowId, type: "arrow" },
      ...(actualTextId && !existing.some((b: any) => b.id === actualTextId)
        ? [{ id: actualTextId, type: "text" }]
        : []),
    ];
    convShape.groupIds = Array.isArray(convShape.groupIds)
      ? convShape.groupIds
      : [];
  }

  if (convText) {
    convText.containerId = actualShapeId;
  }

  const convArrow = normalizeLinearPoints({
    groupIds: [],
    boundElements: [],
    ...convArrowRaw,
    id: actualArrowId,
    startBinding: { elementId: sourceEl.id, focus: 0, gap: 1 },
    endBinding: { elementId: actualShapeId, focus: 0, gap: 1 },
    endArrowhead: "arrow",
    strokeColor,
  });

  const updatedSource = {
    ...sourceEl,
    boundElements: [
      ...(sourceEl.boundElements || []).filter(
        (b: any) => b.id !== actualArrowId,
      ),
      { id: actualArrowId, type: "arrow" },
    ],
    version: (sourceEl.version || 0) + 1,
    versionNonce: Math.floor(Math.random() * 2000000000),
  };

  const updatedElements = currentElements.map((el: any) =>
    el.id === sourceEl.id ? updatedSource : el,
  );
  const newElements = [
    convShape,
    ...(convText ? [convText] : []),
    convArrow,
  ].filter(Boolean);

  return {
    elements: repairFractionalIndicesAndBindings([
      ...updatedElements,
      ...newElements,
    ]),
    newShapeId: actualShapeId,
  };
}
