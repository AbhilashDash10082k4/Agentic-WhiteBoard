// Helper to convert element skeletons into Excalidraw elements dynamically without breaking SSR
export async function convertToElements(skeletons: any[]): Promise<any[]> {
  if (typeof window === "undefined" || !skeletons || skeletons.length === 0) {
    return skeletons || [];
  }
  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
  return convertToExcalidrawElements(skeletons);
}

// Calculate next available empty position to the right of all existing elements
export function getRightmostPlacementPosition(
  elements: readonly any[],
  gap = 80
): { x: number; y: number } {
  const activeElements = (elements || []).filter((el) => !el.isDeleted);

  if (activeElements.length === 0) {
    return { x: 120, y: 120 };
  }

  let maxX = -Infinity;
  let correspondingY = 120;

  for (const el of activeElements) {
    const rightEdge = (el.x ?? 0) + (el.width ?? 0);
    if (rightEdge > maxX) {
      maxX = rightEdge;
      correspondingY = el.y ?? 120;
    }
  }

  return {
    x: Math.round(maxX + gap),
    y: Math.round(correspondingY),
  };
}

// Create an AI generation placeholder rectangle using dynamic Excalidraw converter
export async function createAIGenerationPlaceholderElements(
  x: number,
  y: number,
  title = "Generating with AI",
  width = 340,
  height = 180
) {
  return convertToElements([
    {
      type: "rectangle",
      id: `ai-placeholder-${Date.now()}`,
      x,
      y,
      width,
      height,
      strokeColor: "#9333ea",
      backgroundColor: "#faf5ff",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "dashed",
      roughness: 1,
      roundness: { type: 3 },
      label: {
        text: `✨ ${title}\n\nStructuring components & layout...`,
        fontSize: 16,
        textAlign: "center",
        verticalAlign: "middle",
      },
    },
  ]);
}

// Safely append new elements to existing canvas scene without replacing prior elements
export function appendElementsToCanvas(
  excalidrawAPI: any,
  newElements: readonly any[]
): void {
  if (!excalidrawAPI || !newElements || newElements.length === 0) return;

  const currentElements = excalidrawAPI.getSceneElementsIncludingDeleted();
  const mergedElements = [...currentElements, ...newElements];

  excalidrawAPI.updateScene({
    elements: mergedElements,
  });

  // Focus view near newly created elements
  const first = newElements[0];
  if (first && typeof excalidrawAPI.scrollToContent === "function") {
    excalidrawAPI.scrollToContent(newElements, { animate: true });
  }
}

// Replace placeholder element with final generated diagram elements
export function replacePlaceholderWithGeneratedElements(
  excalidrawAPI: any,
  placeholderId: string,
  newElements: readonly any[]
): void {
  if (!excalidrawAPI || !newElements || newElements.length === 0) return;

  const currentElements = excalidrawAPI.getSceneElementsIncludingDeleted();
  const filtered = currentElements.filter((el: any) => el.id !== placeholderId);
  const merged = [...filtered, ...newElements];

  excalidrawAPI.updateScene({
    elements: merged,
  });

  if (typeof excalidrawAPI.scrollToContent === "function") {
    excalidrawAPI.scrollToContent(newElements, { animate: true });
  }
}
