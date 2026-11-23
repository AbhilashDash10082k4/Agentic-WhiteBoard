/**
 * File: fractional-index-helper.ts
 * Description: Validates, reorders, and assigns valid fractional indices to elements to prevent Excalidraw ordering invariants breakage.
 * Connects to: Whiteboard.tsx, connector-binding-helper.ts, text-container-helper.ts, FloatingToolBar.tsx, use-canvas-autosave.ts
 */

import { generateNKeysBetween } from "fractional-indexing";

/**
 * Function: repairFractionalIndicesAndBindings
 * Description: Orders bound text elements immediately after their container and assigns strictly increasing fractional indices.
 * Connects to: Whiteboard.tsx, connector-binding-helper.ts, text-container-helper.ts, FloatingToolBar.tsx, use-canvas-autosave.ts
 */
export function repairFractionalIndicesAndBindings(
  elements: readonly any[],
): any[] {
  if (!Array.isArray(elements) || elements.length === 0) return [];

  // Map elements by ID for fast lookup and modification
  const elementsMap = new Map<string, any>();
  for (const el of elements) {
    if (el?.id) {
      elementsMap.set(el.id, { ...el });
    }
  }

  // 1. Sanitize two-way bindings between containers and bound text
  for (const el of elementsMap.values()) {
    if (Array.isArray(el.boundElements)) {
      el.boundElements = el.boundElements.filter((b: any) => {
        if (!b?.id) return false;
        const target = elementsMap.get(b.id);
        if (!target) return false;
        // Bound text must have matching containerId to prevent hijacked bindings on clone
        if (b.type === "text") {
          return target.containerId === el.id;
        }
        return true;
      });
    }

    if (el.type === "text" && el.containerId) {
      const container = elementsMap.get(el.containerId);
      if (!container || container.isDeleted) {
        el.containerId = null;
      } else {
        if (!Array.isArray(container.boundElements)) {
          container.boundElements = [];
        }
        if (!container.boundElements.some((b: any) => b.id === el.id)) {
          container.boundElements.push({ id: el.id, type: "text" });
        }
      }
    }
  }

  // 2. Order elements so every bound text element immediately follows its container
  const visited = new Set<string>();
  const ordered: any[] = [];

  for (const el of elements) {
    if (!el?.id || visited.has(el.id)) continue;

    // Defer bound text until its container is placed
    if (
      el.type === "text" &&
      el.containerId &&
      elementsMap.has(el.containerId) &&
      !visited.has(el.containerId)
    ) {
      continue;
    }

    visited.add(el.id);
    const current = elementsMap.get(el.id);
    ordered.push(current);

    // Place all bound text elements immediately after this container
    if (Array.isArray(current.boundElements)) {
      for (const b of current.boundElements) {
        if (b?.type === "text" && elementsMap.has(b.id) && !visited.has(b.id)) {
          const textEl = elementsMap.get(b.id);
          if (textEl && textEl.containerId === current.id) {
            visited.add(textEl.id);
            ordered.push(textEl);
          }
        }
      }
    }
  }

  // Append any remaining orphans
  for (const el of elementsMap.values()) {
    if (!visited.has(el.id)) {
      visited.add(el.id);
      ordered.push(el);
    }
  }

  // 3. Generate strictly increasing fractional indices
  const keys = generateNKeysBetween(null, null, ordered.length);
  return ordered.map((el, idx) => ({
    ...el,
    index: keys[idx],
  }));
}
