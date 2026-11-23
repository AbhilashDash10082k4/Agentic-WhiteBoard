/**
 * File: connector-geometry.ts
 * Description: Geometric calculations for magnetic connector anchors, directional offsets, and linear element normalization.
 * Connects to: connector-binding-helper.ts, magnetic-connector-overlay.tsx
 */

export interface Point {
  x: number;
  y: number;
}

export type AnchorDirection = "top" | "bottom" | "left" | "right";

/**
 * Function: shouldSnap
 * Description: Determines if a pointer point is within snap threshold of a target anchor point.
 * Connects to: magnetic-connector-overlay.tsx
 */
export function shouldSnap(
  pointer: Point,
  anchor: Point,
  threshold = 24,
): boolean {
  return Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y) <= threshold;
}

/**
 * Function: getShapeBorderAnchors
 * Description: Computes midpoints of the four bounding edges (top, bottom, left, right) for a shape.
 * Connects to: magnetic-connector-overlay.tsx
 */
export function getShapeBorderAnchors(el: any): Record<AnchorDirection, Point> {
  const sx = Math.min(el.x ?? 0, (el.x ?? 0) + (el.width ?? 0));
  const sy = Math.min(el.y ?? 0, (el.y ?? 0) + (el.height ?? 0));
  const sw = Math.abs(el.width ?? 0);
  const sh = Math.abs(el.height ?? 0);
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;

  return {
    top: { x: cx, y: sy },
    bottom: { x: cx, y: sy + sh },
    left: { x: sx, y: cy },
    right: { x: sx + sw, y: cy },
  };
}

/**
 * Function: getDirectionalConnectionPoints
 * Description: Calculates source point, target point, and target shape bounds along a cardinal direction with specified gap.
 * Connects to: connector-binding-helper.ts, magnetic-connector-overlay.tsx
 */
export function getDirectionalConnectionPoints(
  sourceEl: any,
  dir: AnchorDirection,
  gap = 90,
): {
  sourcePoint: Point;
  targetPoint: Point;
  targetShape: { x: number; y: number; width: number; height: number };
} {
  const sw = Math.abs(sourceEl.width || 140);
  const sh = Math.abs(sourceEl.height || 70);
  const sx = Math.min(
    sourceEl.x ?? 0,
    (sourceEl.x ?? 0) + (sourceEl.width ?? 0),
  );
  const sy = Math.min(
    sourceEl.y ?? 0,
    (sourceEl.y ?? 0) + (sourceEl.height ?? 0),
  );
  const cx = sx + sw / 2;
  const cy = sy + sh / 2;

  switch (dir) {
    case "right":
      return {
        sourcePoint: { x: sx + sw, y: cy },
        targetPoint: { x: sx + sw + gap, y: cy },
        targetShape: { x: sx + sw + gap, y: sy, width: sw, height: sh },
      };
    case "left":
      return {
        sourcePoint: { x: sx, y: cy },
        targetPoint: { x: sx - gap, y: cy },
        targetShape: { x: sx - gap - sw, y: sy, width: sw, height: sh },
      };
    case "bottom":
      return {
        sourcePoint: { x: cx, y: sy + sh },
        targetPoint: { x: cx, y: sy + sh + gap },
        targetShape: { x: sx, y: sy + sh + gap, width: sw, height: sh },
      };
    case "top":
    default:
      return {
        sourcePoint: { x: cx, y: sy },
        targetPoint: { x: cx, y: sy - gap },
        targetShape: { x: sx, y: sy - gap - sh, width: sw, height: sh },
      };
  }
}

/**
 * Function: normalizeLinearPoints
 * Description: Normalizes linear element points relative to (0,0) offset to prevent Excalidraw linear crash.
 * Connects to: connector-binding-helper.ts
 */
export function normalizeLinearPoints(element: any) {
  if (!element?.points || element.points.length === 0) return element;
  const [offsetX, offsetY] = element.points[0];
  if (offsetX === 0 && offsetY === 0) return element;
  return {
    ...element,
    points: element.points.map(([px, py]: [number, number]) => [
      px - offsetX,
      py - offsetY,
    ]),
    x: element.x + offsetX,
    y: element.y + offsetY,
  };
}
