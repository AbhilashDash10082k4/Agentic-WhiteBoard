"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { CanvasToolbar } from "@/components/workspace/canvas-toolbar";
import { FloatingToolBar } from "@/components/workspace/FloatingToolBar";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard.css";

// Dynamic import with ssr: false to prevent Next.js SSR canvas errors
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted/10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

// Static immutable UI options to avoid re-render loops
const UI_OPTIONS = {
  canvasActions: {
    loadScene: false,
    export: {
      saveFileToDisk: true,
    },
    saveAsImage: true,
  },
};

// Fast deterministic element & scene signature for dirty checking
function getCanvasSignature(elements: readonly any[], appState: any): string {
  const elTokens = (elements || [])
    .filter((e) => !e.isDeleted)
    .map((e) => `${e.id}:${e.version}:${e.x}:${e.y}:${e.width}:${e.height}:${e.strokeColor}:${e.backgroundColor}`)
    .join(";");
  return `${elTokens}|bg:${appState?.viewBackgroundColor || ""}`;
}

interface WhiteboardProps {
  boardId: string;
}

export function Whiteboard({ boardId }: WhiteboardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [activeTool, setActiveTool] = React.useState<string>("selection");
  const [apiReady, setApiReady] = React.useState<any>(null);
  const [selectedElement, setSelectedElement] = React.useState<any>(null);
  const [floatingPos, setFloatingPos] = React.useState<{ x: number; y: number } | null>(null);

  const { resolvedTheme } = useTheme();
  const excalidrawAPIRef = React.useRef<any>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentVersionRef = React.useRef<number>(1);
  const lastSavedSigRef = React.useRef<string>("");
  const latestDataRef = React.useRef<{
    elements: readonly any[];
    appState: any;
    files: any;
  } | null>(null);
  const isInitialLoadRef = React.useRef(true);

  // Memoized API callback to prevent Excalidraw render cycle
  const handleExcalidrawAPI = React.useCallback((api: any) => {
    excalidrawAPIRef.current = api;
    setApiReady((prev: any) => (prev === api ? prev : api));
  }, []);

  // Sync dark mode changes to Excalidraw canvas only when different
  React.useEffect(() => {
    if (excalidrawAPIRef.current && resolvedTheme) {
      const targetTheme = resolvedTheme === "dark" ? "dark" : "light";
      const currentTheme = excalidrawAPIRef.current.getAppState()?.theme;
      if (currentTheme !== targetTheme) {
        excalidrawAPIRef.current.updateScene({
          appState: { theme: targetTheme },
        });
      }
    }
  }, [resolvedTheme]);

  // Save canvas state to DB via API endpoint with signature sync & OCC
  const saveCanvasChanges = React.useCallback(async () => {
    if (!latestDataRef.current || !boardId) return;

    const currentSig = getCanvasSignature(
      latestDataRef.current.elements,
      latestDataRef.current.appState
    );

    if (currentSig === lastSavedSigRef.current) return;

    setSaveStatus("saving");
    try {
      const res = await axios.post("/api/board/data", {
        boardId,
        version: currentVersionRef.current,
        elements: latestDataRef.current.elements,
        appState: latestDataRef.current.appState,
        files: latestDataRef.current.files,
      });

      if (res.data?.success && res.data?.data) {
        currentVersionRef.current = res.data.data.version ?? (currentVersionRef.current + 1);
        lastSavedSigRef.current = currentSig;
        setSaveStatus("saved");

        toast({
          title: "Canvas saved",
          description: `Board synced (v${currentVersionRef.current}).`,
          variant: "success",
        });

        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (error: any) {
      setSaveStatus("idle");
      if (error?.response?.status === 409) {
        toast({
          title: "Sync Conflict",
          description: "Newer version exists on server. Refresh to sync.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Save failed",
        description: "Could not auto-save canvas changes.",
        variant: "destructive",
      });
    }
  }, [boardId]);

  // Stable change handler: uses functional equality updaters to prevent re-render loops
  const handleCanvasChange = React.useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (appState?.activeTool?.type) {
        setActiveTool((prev) =>
          prev === appState.activeTool.type ? prev : appState.activeTool.type
        );
      }

      // Check single element selection for floating toolbar
      const selectedIds = Object.keys(appState?.selectedElementIds || {}).filter(
        (id) => appState.selectedElementIds[id]
      );

      if (selectedIds.length === 1) {
        const el = elements.find((item: any) => item.id === selectedIds[0] && !item.isDeleted);
        if (el) {
          const zoom = appState.zoom?.value ?? 1;
          const screenX = (el.x + (appState.scrollX ?? 0)) * zoom;
          const screenY = (el.y + (appState.scrollY ?? 0)) * zoom;
          const targetX = Math.round(Math.max(16, screenX));
          const targetY = Math.round(Math.max(70, screenY - 54));

          setSelectedElement((prev: any) =>
            prev?.id === el.id && prev?.version === el.version && prev?.versionNonce === el.versionNonce
              ? prev
              : el
          );

          setFloatingPos((prev) =>
            prev && prev.x === targetX && prev.y === targetY
              ? prev
              : { x: targetX, y: targetY }
          );
        } else {
          setSelectedElement((prev: any) => (prev === null ? null : null));
          setFloatingPos((prev) => (prev === null ? null : null));
        }
      } else {
        setSelectedElement((prev: any) => (prev === null ? null : null));
        setFloatingPos((prev) => (prev === null ? null : null));
      }

      if (isInitialLoadRef.current) return;
      latestDataRef.current = { elements, appState, files };

      // Debounce save 10 seconds only when canvas state modified
      const currentSig = getCanvasSignature(elements, appState);
      if (currentSig !== lastSavedSigRef.current) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          saveCanvasChanges();
        }, 10000);
      }
    },
    [saveCanvasChanges]
  );

  // Load existing canvas data on board mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadBoardData() {
      try {
        const res = await axios.get(`/api/board/data?boardId=${boardId}`);
        if (res.data?.success && res.data?.data && isMounted) {
          const { elements, appState, files, version } = res.data.data;
          if (version) currentVersionRef.current = version;

          if (elements || appState) {
            setInitialData({
              elements: elements || [],
              appState: appState || {},
            });

            lastSavedSigRef.current = getCanvasSignature(elements || [], appState || {});

            if (excalidrawAPIRef.current) {
              excalidrawAPIRef.current.updateScene({
                elements: elements || [],
                appState: appState || {},
              });
              if (files && excalidrawAPIRef.current.addFiles) {
                excalidrawAPIRef.current.addFiles(Object.values(files));
              }
            }
          }
        }
      } catch {
        // First-time board defaults to empty state
      } finally {
        if (isMounted) {
          setMounted(true);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 1000);
        }
      }
    }

    if (boardId) loadBoardData();

    return () => {
      isMounted = false;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [boardId]);

  if (!mounted) {
    return (
      <div className="flex size-full items-center justify-center bg-muted/10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative size-full pt-14 bg-background">
      {/* Custom Left Floating Toolset */}
      <CanvasToolbar
        excalidrawAPI={apiReady}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      {/* Floating Element Properties Toolset */}
      <FloatingToolBar
        selectedElement={selectedElement}
        position={floatingPos}
        excalidrawAPI={apiReady}
        onClose={() => {
          setSelectedElement(null);
          setFloatingPos(null);
        }}
      />

      {/* Auto-save status indicator */}
      <div className="absolute right-4 bottom-4 z-20 pointer-events-none">
        {saveStatus === "saving" && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-md animate-in fade-in">
            <Loader2 className="size-3 animate-spin text-amber-500" />
            <span>Saving canvas...</span>
          </div>
        )}
        {saveStatus === "saved" && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-xs backdrop-blur-md animate-in fade-in">
            <Check className="size-3 text-emerald-500" />
            <span>All changes saved</span>
          </div>
        )}
      </div>

      <Excalidraw
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        initialData={initialData}
        onChange={handleCanvasChange}
        excalidrawAPI={handleExcalidrawAPI}
        UIOptions={UI_OPTIONS}
      />
    </div>
  );
}
