/**
 * File: Whiteboard.tsx
 * Description: Core whiteboard component integrating dynamic Excalidraw instance, toolbars, overlays, and autosave.
 * Connects to: FloatingToolBar.tsx, magnetic-connector-overlay.tsx, canvas-toolbar.tsx, canvas-bottom-bar.tsx, use-canvas-autosave.ts
 */

"use client";

import dynamic from "next/dynamic";
import { Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { CanvasToolbar } from "@/components/workspace/canvas-toolbar";
import { CanvasBottomBar } from "@/components/workspace/canvas-bottom-bar";
import { FloatingToolBar } from "@/components/workspace/FloatingToolBar";
import { MagneticConnectorOverlay } from "@/components/workspace/magnetic-connector-overlay";
import { AIChatPopover } from "@/components/workspace/ai-chat/ai-chat-popover";
import { AIChatSidebar } from "@/components/workspace/ai-chat/ai-chat-sidebar";
import { ChatMessage } from "@/components/workspace/ai-chat/ai-chat-types";
import { ensureShapeTextContainer } from "./text-container-helper";
import { repairFractionalIndicesAndBindings } from "./fractional-index-helper";
import { useCanvasAutoSave } from "@/hooks/use-canvas-autosave";
import { useDiagramGenerator } from "../../hooks/use-diagram-generator";
import { useElementStyleDefaults } from "@/hooks/use-element-style-defaults";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard.css";
import { useCallback, useEffect, useState } from "react";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted/10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

const UI_OPTIONS = {
  canvasActions: {
    loadScene: false,
    export: { saveFileToDisk: true },
    saveAsImage: true,
  },
};

interface WhiteboardProps {
  boardId: string;
  isSidebarOpen?: boolean;
}

/**
 * Function: Whiteboard
 * Description: Main canvas workspace rendering the Excalidraw engine, floating context toolbar, and magnetic connectors.
 * Connects to: page.tsx, useCanvasAutoSave, FloatingToolBar.tsx, MagneticConnectorOverlay.tsx
 */
export function Whiteboard({
  boardId,
  isSidebarOpen = false,
}: WhiteboardProps) {
  const {
    mounted,
    initialData,
    saveStatus,
    filesRef,
    excalidrawAPIRef,
    scheduleAutoSave,
  } = useCanvasAutoSave(boardId);

  const [activeTool, setActiveTool] = useState<string>("selection");
  const [apiReady, setApiReady] = useState<any>(null);

  const { recordStyleChange, applyToolDefaults } = useElementStyleDefaults(
    boardId,
    apiReady,
  );
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [floatingPos, setFloatingPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [viewport, setViewport] = useState({
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
  });
  const [chatMode, setChatMode] = useState<"closed" | "popover" | "sidebar">(
    "closed",
  );
  const [activeSidekick, setActiveSidekick] = useState<string>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { isGenerating, handleGenerateDiagram } = useDiagramGenerator(
    excalidrawAPIRef,
    setMessages,
  );

  const { resolvedTheme } = useTheme();

  // Close chat when clicking outside
  useEffect(() => {
    if (chatMode === "closed") return;
    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("[data-ai-chat-container]") ||
        target?.closest("[data-ai-bottom-bar]")
      ) {
        return;
      }
      setChatMode("closed");
    };
    window.addEventListener("pointerdown", handleClickOutside);
    return () => window.removeEventListener("pointerdown", handleClickOutside);
  }, [chatMode]);

  // Turn selected shape into editable text container on double click
  useEffect(() => {
    const onDblClick = () => {
      const api = excalidrawAPIRef.current;
      if (!api) return;
      const appState = api.getAppState?.();
      const selectedIds = Object.keys(
        appState?.selectedElementIds || {},
      ).filter((id) => appState.selectedElementIds[id]);
      if (selectedIds.length === 1) {
        const elements = api.getSceneElements?.() || [];
        const shape = elements.find(
          (el: any) => el.id === selectedIds[0] && !el.isDeleted,
        );
        if (shape && ["rectangle", "diamond", "ellipse"].includes(shape.type)) {
          ensureShapeTextContainer(shape, api);
        }
      }
    };
    window.addEventListener("dblclick", onDblClick);
    return () => window.removeEventListener("dblclick", onDblClick);
  }, [excalidrawAPIRef]);

  const handleExcalidrawAPI = useCallback(
    (api: any) => {
      excalidrawAPIRef.current = api;
      setApiReady((prev: any) => (prev === api ? prev : api));
      try {
        const currentElements = api.getSceneElementsIncludingDeleted?.() || [];
        if (currentElements.length > 0) {
          const repaired = repairFractionalIndicesAndBindings(currentElements);
          api.updateScene({ elements: repaired });
        }
      } catch {
        // ignore
      }
      if (
        filesRef.current &&
        Object.keys(filesRef.current).length > 0 &&
        typeof api.addFiles === "function"
      ) {
        api.addFiles(Object.values(filesRef.current));
      }
    },
    [excalidrawAPIRef, filesRef],
  );

  useEffect(() => {
    if (excalidrawAPIRef.current && resolvedTheme) {
      const target = resolvedTheme === "dark" ? "dark" : "light";
      if (excalidrawAPIRef.current.getAppState()?.theme !== target) {
        excalidrawAPIRef.current.updateScene({ appState: { theme: target } });
      }
    }
  }, [resolvedTheme, excalidrawAPIRef]);

  const handleZoomIn = useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({
      appState: { zoom: { value: Math.min(3, cur + 0.1) } },
    });
  }, [excalidrawAPIRef]);

  const handleZoomOut = useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({
      appState: { zoom: { value: Math.max(0.1, cur - 0.1) } },
    });
  }, [excalidrawAPIRef]);

  const handleResetZoom = useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    excalidrawAPIRef.current.updateScene({ appState: { zoom: { value: 1 } } });
  }, [excalidrawAPIRef]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveSidekick("general");
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
        timestamp: new Date(),
      },
    ]);
    setChatMode("sidebar");
  }, []);

  const handleCanvasChange = useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (!elements || !Array.isArray(elements)) return;
      if (appState?.activeTool?.type) {
        setActiveTool((prev) =>
          prev === appState.activeTool.type ? prev : appState.activeTool.type,
        );
      }
      const curZoom = appState?.zoom?.value ?? 1;
      const curScrollX = appState?.scrollX ?? 0;
      const curScrollY = appState?.scrollY ?? 0;
      setViewport((prev) =>
        prev.scrollX === curScrollX &&
        prev.scrollY === curScrollY &&
        prev.zoom === curZoom
          ? prev
          : { scrollX: curScrollX, scrollY: curScrollY, zoom: curZoom },
      );

      const selectedIds = Object.keys(
        appState?.selectedElementIds || {},
      ).filter((id) => appState.selectedElementIds[id]);
      if (selectedIds.length === 1) {
        const el = elements.find(
          (item: any) => item?.id === selectedIds[0] && !item?.isDeleted,
        );
        if (el) {
          const z = appState.zoom?.value ?? 1;
          const sw = Math.abs(el.width ?? 0) * z;
          const sx =
            (Math.min(el.x ?? 0, (el.x ?? 0) + (el.width ?? 0)) +
              (appState.scrollX ?? 0)) *
            z;
          const sy =
            (Math.min(el.y ?? 0, (el.y ?? 0) + (el.height ?? 0)) +
              (appState.scrollY ?? 0)) *
            z;
          const tx = Math.round(sx + sw / 2);
          const ty = Math.round(Math.max(70, sy - 54));
          setSelectedElement((prev: any) => {
            if (
              prev &&
              prev.id === el.id &&
              prev.version === el.version &&
              prev.x === el.x &&
              prev.y === el.y &&
              prev.width === el.width &&
              prev.height === el.height
            ) {
              return prev;
            }
            return { ...el };
          });
          setFloatingPos((prev) =>
            prev && prev.x === tx && prev.y === ty ? prev : { x: tx, y: ty },
          );
        } else {
          setSelectedElement(null);
          setFloatingPos(null);
        }
      } else {
        setSelectedElement(null);
        setFloatingPos(null);
      }

      scheduleAutoSave(elements, appState, files);
    },
    [scheduleAutoSave],
  );

  if (!mounted) {
    return (
      <div className="flex size-full items-center justify-center bg-muted/10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative size-full pt-14 bg-background overflow-hidden">
      <CanvasToolbar
        excalidrawAPI={apiReady}
        activeTool={activeTool}
        isSidebarOpen={isSidebarOpen}
        onSelectTool={(toolId) => {
          setActiveTool(toolId);
          applyToolDefaults(toolId);
        }}
      />

      <AIChatPopover
        isOpen={chatMode === "popover"}
        activeSidekick={activeSidekick}
        onSelectSidekick={setActiveSidekick}
        onOpenSidePanel={() => setChatMode("sidebar")}
        onClose={() => setChatMode("closed")}
        onSendMessage={handleSendMessage}
        onGenerateDiagram={handleGenerateDiagram}
        isGenerating={isGenerating}
      />

      <AIChatSidebar
        isOpen={chatMode === "sidebar"}
        messages={messages}
        activeSidekick={activeSidekick}
        onSelectSidekick={setActiveSidekick}
        onRestorePopover={() => setChatMode("popover")}
        onClose={() => setChatMode("closed")}
        onSendMessage={handleSendMessage}
        onNewChat={handleNewChat}
        onGenerateDiagram={handleGenerateDiagram}
        isGenerating={isGenerating}
      />

      <CanvasBottomBar
        zoom={Math.round(viewport.zoom * 100)}
        isSidebarOpen={isSidebarOpen}
        isRightSidebarOpen={chatMode === "sidebar"}
        isChatOpen={chatMode !== "closed"}
        onOpenChat={() => setChatMode("popover")}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      <div className="absolute right-4 bottom-16 z-20 pointer-events-none">
        {saveStatus === "saving" && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-md">
            <Loader2 className="size-3 animate-spin text-amber-500" />
            <span>Saving canvas...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-md">
            <Check className="size-3 text-emerald-500" />
            <span>All changes saved</span>
          </div>
        )}
      </div>

      {/* Canvas container: exactly matches Excalidraw viewport */}
      <div className="relative size-full overflow-hidden">
        <MagneticConnectorOverlay
          selectedElement={selectedElement}
          excalidrawAPI={apiReady}
          viewport={viewport}
        />
        <Excalidraw
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          initialData={initialData}
          onChange={handleCanvasChange}
          excalidrawAPI={handleExcalidrawAPI}
          UIOptions={UI_OPTIONS}
        />
      </div>

      {/* Floating Toolbar rendered after canvas in DOM with z-50 to guarantee dropdowns appear above magnetic connectors */}
      <FloatingToolBar
        selectedElement={selectedElement}
        position={floatingPos}
        excalidrawAPI={apiReady}
        onStyleChange={recordStyleChange}
        onClose={() => {
          setSelectedElement(null);
          setFloatingPos(null);
        }}
      />
    </div>
  );
}
