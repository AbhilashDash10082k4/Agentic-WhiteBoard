/**
 * File: text-container-helper.ts
 * Description: Ensures shapes (rectangles, diamonds, ellipses) have bound text containers for inline text editing.
 * Connects to: ai-canvas-generator.ts, fractional-index-helper.ts, FloatingToolBar.tsx
 */

import { convertToElements } from "./ai-chat/ai-canvas-generator";
import { repairFractionalIndicesAndBindings } from "./fractional-index-helper";

/**
 * Function: ensureShapeTextContainer
 * Description: Converts any container shape into an Excalidraw text container with an editable label if not already present.
 * Connects to: FloatingToolBar.tsx, floating-text-options.tsx
 */
export async function ensureShapeTextContainer(
  shape: any,
  excalidrawAPI: any,
  defaultText = "Text",
) {
  if (!shape || !excalidrawAPI) return null;
  if (!["rectangle", "diamond", "ellipse"].includes(shape.type)) return null;

  const currentElements = excalidrawAPI.getSceneElementsIncludingDeleted();
  const hasText = shape.boundElements?.some((b: any) => b.type === "text");

  if (hasText) {
    const existingText = currentElements.find(
      (el: any) =>
        el.type === "text" && el.containerId === shape.id && !el.isDeleted,
    );
    if (existingText) {
      excalidrawAPI.updateScene({
        appState: {
          editingElement: existingText,
          selectedElementIds: { [shape.id]: true },
        },
      });
      return existingText;
    }
  }

  const skeleton = {
    type: shape.type,
    id: shape.id,
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
    strokeColor: shape.strokeColor || "#1e1e1e",
    backgroundColor: shape.backgroundColor || "transparent",
    fillStyle: shape.fillStyle || "solid",
    strokeWidth: shape.strokeWidth || 2,
    roundness: shape.roundness ?? { type: 3 },
    label: {
      text: defaultText,
      fontSize: 16,
      textAlign: "center",
      verticalAlign: "middle",
    },
  };

  const converted = await convertToElements([skeleton], {
    regenerateIds: false,
  });
  const rest = currentElements.filter(
    (el: any) => el.id !== shape.id && el.containerId !== shape.id,
  );

  const updated = repairFractionalIndicesAndBindings([...rest, ...converted]);
  excalidrawAPI.updateScene({
    elements: updated,
  });

  const childText = converted.find(
    (el: any) => el.type === "text" && (el as any).containerId === shape.id,
  );

  if (childText) {
    setTimeout(() => {
      excalidrawAPI.updateScene({
        appState: {
          editingElement: childText,
          selectedElementIds: { [shape.id]: true },
        },
      });
    }, 50);
  }

  return childText;
}
