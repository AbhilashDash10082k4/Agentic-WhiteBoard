/**
 * File: use-element-style-defaults.ts
 * Description: Hook and persistence manager that remembers element style adjustments (colors, stroke, font, alignment) as workspace defaults for future elements.
 * Connects to: Whiteboard.tsx, FloatingToolBar.tsx, CanvasToolbar.tsx
 */

"use client";

import * as React from "react";

export interface ElementStyleRecord {
  strokeColor?: string;
  backgroundColor?: string;
  fillStyle?: string;
  strokeWidth?: number;
  strokeStyle?: string;
  roughness?: number;
  roundness?: any;
  fontFamily?: number;
  fontSize?: number;
  textAlign?: string;
  opacity?: number;
}

export interface WorkspaceStyleDefaults {
  global: ElementStyleRecord;
  byType: Record<string, ElementStyleRecord>;
}

const STYLE_KEYS: (keyof ElementStyleRecord)[] = [
  "strokeColor",
  "backgroundColor",
  "fillStyle",
  "strokeWidth",
  "strokeStyle",
  "roughness",
  "roundness",
  "fontFamily",
  "fontSize",
  "textAlign",
  "opacity",
];

const STYLE_TO_APP_STATE_MAP: Record<keyof ElementStyleRecord, string> = {
  strokeColor: "currentItemStrokeColor",
  backgroundColor: "currentItemBackgroundColor",
  fillStyle: "currentItemFillStyle",
  strokeWidth: "currentItemStrokeWidth",
  strokeStyle: "currentItemStrokeStyle",
  roughness: "currentItemRoughness",
  roundness: "currentItemRoundness",
  fontFamily: "currentItemFontFamily",
  fontSize: "currentItemFontSize",
  textAlign: "currentItemTextAlign",
  opacity: "currentItemOpacity",
};

/**
 * Function: getStorageKey
 * Description: Generates localStorage key for whiteboard style defaults scoped to boardId.
 * Connects to: loadStyleDefaults, saveStyleDefaults
 */
function getStorageKey(boardId: string): string {
  return `agentic_whiteboard_style_defaults_${boardId || "default"}`;
}

/**
 * Function: loadStyleDefaults
 * Description: Loads saved style defaults from localStorage with fallback to empty structures.
 * Connects to: useElementStyleDefaults
 */
export function loadStyleDefaults(boardId: string): WorkspaceStyleDefaults {
  if (typeof window === "undefined") {
    return { global: {}, byType: {} };
  }
  try {
    const raw = localStorage.getItem(getStorageKey(boardId));
    if (!raw) return { global: {}, byType: {} };
    const parsed = JSON.parse(raw);
    return {
      global: parsed?.global || {},
      byType: parsed?.byType || {},
    };
  } catch {
    return { global: {}, byType: {} };
  }
}

/**
 * Function: saveStyleDefaults
 * Description: Persists workspace style defaults to localStorage.
 * Connects to: useElementStyleDefaults
 */
export function saveStyleDefaults(
  boardId: string,
  defaults: WorkspaceStyleDefaults,
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(boardId), JSON.stringify(defaults));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Function: applyStylesToExcalidraw
 * Description: Maps style attributes to Excalidraw appState currentItem* properties and updates scene.
 * Connects to: useElementStyleDefaults
 */
export function applyStylesToExcalidraw(
  excalidrawAPI: any,
  styles: ElementStyleRecord,
): void {
  if (!excalidrawAPI || !styles) return;

  const appStateUpdates: Record<string, any> = {};
  for (const key of STYLE_KEYS) {
    if (styles[key] !== undefined) {
      const appStateKey = STYLE_TO_APP_STATE_MAP[key];
      if (appStateKey) {
        appStateUpdates[appStateKey] = styles[key];
      }
    }
  }

  if (Object.keys(appStateUpdates).length > 0) {
    excalidrawAPI.updateScene({ appState: appStateUpdates });
  }
}

/**
 * Function: useElementStyleDefaults
 * Description: Manages workspace element style defaults, syncing changes from modified elements to future element creation.
 * Connects to: Whiteboard.tsx, FloatingToolBar.tsx
 */
export function useElementStyleDefaults(boardId: string, excalidrawAPI: any) {
  const defaultsRef = React.useRef<WorkspaceStyleDefaults>({
    global: {},
    byType: {},
  });

  // Load defaults on mount / boardId change
  React.useEffect(() => {
    defaultsRef.current = loadStyleDefaults(boardId);
  }, [boardId]);

  // Sync saved defaults to Excalidraw when API is ready
  React.useEffect(() => {
    if (!excalidrawAPI) return;
    const initial = defaultsRef.current.global;
    if (Object.keys(initial).length > 0) {
      applyStylesToExcalidraw(excalidrawAPI, initial);
    }
  }, [excalidrawAPI]);

  // Record style updates from an active element and set as defaults
  const recordStyleChange = React.useCallback(
    (elementType: string, updates: Record<string, any>) => {
      const filtered: ElementStyleRecord = {};
      let hasStyleKey = false;

      for (const key of STYLE_KEYS) {
        if (updates[key] !== undefined) {
          filtered[key] = updates[key];
          hasStyleKey = true;
        }
      }

      if (!hasStyleKey) return;

      const current = defaultsRef.current;
      const typeKey = elementType || "general";
      const updatedByType = {
        ...current.byType,
        [typeKey]: {
          ...(current.byType[typeKey] || {}),
          ...filtered,
        },
      };
      const updatedGlobal = {
        ...current.global,
        ...filtered,
      };

      const newDefaults: WorkspaceStyleDefaults = {
        global: updatedGlobal,
        byType: updatedByType,
      };

      defaultsRef.current = newDefaults;
      saveStyleDefaults(boardId, newDefaults);

      // Immediately sync with Excalidraw currentItem props
      if (excalidrawAPI) {
        applyStylesToExcalidraw(excalidrawAPI, filtered);
      }
    },
    [boardId, excalidrawAPI],
  );

  // Apply stored defaults when switching tools (e.g., rectangle, arrow, text)
  const applyToolDefaults = React.useCallback(
    (toolType: string) => {
      if (!excalidrawAPI) return;
      const toolStyles = defaultsRef.current.byType[toolType];
      const merged = {
        ...defaultsRef.current.global,
        ...(toolStyles || {}),
      };
      if (Object.keys(merged).length > 0) {
        applyStylesToExcalidraw(excalidrawAPI, merged);
      }
    },
    [excalidrawAPI],
  );

  const getDefaultsForType = React.useCallback(
    (elementType: string): ElementStyleRecord => {
      return {
        ...defaultsRef.current.global,
        ...(defaultsRef.current.byType[elementType] || {}),
      };
    },
    [],
  );

  return {
    recordStyleChange,
    applyToolDefaults,
    getDefaultsForType,
  };
}
