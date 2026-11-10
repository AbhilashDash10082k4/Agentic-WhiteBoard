"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { CanvasToolbar } from "@/components/workspace/canvas-toolbar";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard.css";

// Dynamic import with ssr: false to prevent Next.js SSR window/canvas errors
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

// Deterministic SHA-256 canvas state hash for dirty checking
async function computeCanvasHash(
  elements: readonly any[],
  appState: any,
  files: any,
): Promise<string> {
  const normalized = {
    elements: (elements || []).map((el) => ({
      id: el.id,
      v: el.version,
      vn: el.versionNonce,
      d: el.isDeleted,
      x: el.x,
      y: el.y,
      w: el.width,
      h: el.height,
    })),
    appState: {
      bg: appState?.viewBackgroundColor,
      grid: appState?.gridSize,
      theme: appState?.theme,
    },
    filesCount: files ? Object.keys(files).length : 0,
  };

  const buffer = new TextEncoder().encode(JSON.stringify(normalized));
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface WhiteboardProps {
  boardId: string;
}

export function Whiteboard({ boardId }: WhiteboardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [activeTool, setActiveTool] = React.useState<string>("selection");
  const [apiReady, setApiReady] = React.useState<any>(null);

  const { resolvedTheme } = useTheme();
  const excalidrawAPIRef = React.useRef<any>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentVersionRef = React.useRef<number>(1);
  const lastSavedHashRef = React.useRef<string>("");
  const latestDataRef = React.useRef<{
    elements: readonly any[];
    appState: any;
    files: any;
  } | null>(null);
  const isInitialLoadRef = React.useRef(true);

  // Sync dark mode changes to Excalidraw canvas via Imperative API
  React.useEffect(() => {
    if (excalidrawAPIRef.current && resolvedTheme) {
      excalidrawAPIRef.current.updateScene({
        appState: {
          theme: resolvedTheme === "dark" ? "dark" : "light",
        },
      });
    }
  }, [resolvedTheme, apiReady]);

  // Save canvas state to DB via API endpoint with hashing & OCC
  const saveCanvasChanges = async () => {
    if (!latestDataRef.current || !boardId) return;

    // Compute canvas hash and skip if identical to last save (Dirty check)
    const currentHash = await computeCanvasHash(
      latestDataRef.current.elements,
      latestDataRef.current.appState,
      latestDataRef.current.files,
    );

    if (currentHash === lastSavedHashRef.current) {
      return;
    }

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
        currentVersionRef.current =
          res.data.data.version ?? currentVersionRef.current + 1;
        lastSavedHashRef.current = currentHash;
        setSaveStatus("saved");

        // Trigger shadcn toast notification
        toast({
          title: "Canvas saved",
          description: `Board synced (v${currentVersionRef.current}).`,
          variant: "success",
        });

        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (error: any) {
      setSaveStatus("idle");

      // Handle Optimistic Concurrency Control conflict
      if (error?.response?.status === 409) {
        toast({
          title: "Sync Conflict",
          description: "Newer version exists on server. Refresh to sync.",
          variant: "destructive",
        });
        return;
      }

      console.error("Auto-save failed:", error);
      toast({
        title: "Save failed",
        description: "Could not auto-save canvas changes.",
        variant: "destructive",
      });
    }
  };

  // Excalidraw change handler: syncs active tool and debounces save to every 10s
  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any,
  ) => {
    // Sync active tool state from Excalidraw to custom toolbar
    if (appState?.activeTool?.type && appState.activeTool.type !== activeTool) {
      setActiveTool(appState.activeTool.type);
    }

    // Skip change persistence during initial hydration
    if (isInitialLoadRef.current) return;

    latestDataRef.current = { elements, appState, files };

    // Schedule save every 10 seconds if not already scheduled
    if (!saveTimerRef.current) {
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        saveCanvasChanges();
      }, 10000);
    }
  };

  // Load existing canvas data on board mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadBoardData() {
      try {
        const res = await axios.get(`/api/board/data?boardId=${boardId}`);
        if (res.data?.success && res.data?.data && isMounted) {
          const { elements, appState, files, version } = res.data.data;
          if (version) {
            currentVersionRef.current = version;
          }

          if (elements || appState) {
            setInitialData({
              elements: elements || [],
              appState: appState || {},
            });

            // Seed initial hash to prevent false dirty save on mount
            const initialHash = await computeCanvasHash(
              elements,
              appState,
              files,
            );
            lastSavedHashRef.current = initialHash;

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
        // First time opening board defaults to blank canvas
      } finally {
        if (isMounted) {
          setMounted(true);
          setTimeout(() => {
            isInitialLoadRef.current = false;
          }, 1200);
        }
      }
    }

    if (boardId) {
      loadBoardData();
    }

    return () => {
      isMounted = false;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
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
      {/* Custom Floating Toolbar */}
      <CanvasToolbar
        excalidrawAPI={apiReady}
        activeTool={activeTool}
        onSelectTool={setActiveTool}
      />

      {/* Subtle auto-save status indicator badge */}
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
        initialData={initialData}
        onChange={handleCanvasChange}
        excalidrawAPI={(api: any) => {
          excalidrawAPIRef.current = api;
          setApiReady(api);
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: {
              saveFileToDisk: true,
            },
            saveAsImage: true,
          },
        }}
      />
    </div>
  );
}
