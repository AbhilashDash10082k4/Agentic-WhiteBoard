import * as React from "react";

// Hook to detect whether user is currently dragging or interacting with an element on canvas
export function useIsMovingElement(excalidrawAPI: any): boolean {
  const [isMoving, setIsMoving] = React.useState(false);

  React.useEffect(() => {
    if (!excalidrawAPI) return;

    let pointerDown = false;
    let startX = 0;
    let startY = 0;
    let timer: NodeJS.Timeout | null = null;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.("[data-magnetic-handle]")) return;

      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      pointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return;
      const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
      if (dist > 3) {
        setIsMoving(true);
      }
    };

    const onPointerUp = () => {
      pointerDown = false;
      if (timer) clearTimeout(timer);
      // Wait for Excalidraw to finish internal layout before revealing handles
      timer = setTimeout(() => {
        setIsMoving(false);
        timer = null;
      }, 50);
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("pointerup", onPointerUp, { capture: true });

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("pointerdown", onPointerDown, { capture: true });
      window.removeEventListener("pointermove", onPointerMove, { capture: true });
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
    };
  }, [excalidrawAPI]);

  return isMoving;
}
