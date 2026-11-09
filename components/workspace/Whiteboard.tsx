"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Loader2, Check } from "lucide-react";
import "@excalidraw/excalidraw/index.css";

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
  }
);

interface WhiteboardProps {
  boardId: string;
}

export function Whiteboard({ boardId }: WhiteboardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  const excalidrawAPIRef = React.useRef<any>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = React.useRef<{
    elements: readonly any[];
    appState: any;
    files: any;
  } | null>(null);
  const isInitialLoadRef = React.useRef(true);

  // Save canvas state to DB via API endpoint
  const saveCanvasChanges = async () => {
    if (!latestDataRef.current || !boardId) return;

    setSaveStatus("saving");
    try {
      await axios.post("/api/board/data", {
        boardId,
        elements: latestDataRef.current.elements,
        appState: latestDataRef.current.appState,
        files: latestDataRef.current.files,
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("idle");
    }
  };

  // Excalidraw change handler: debounces save to every 10 seconds
  const handleCanvasChange = (
    elements: readonly any[],
    appState: any,
    files: any
  ) => {
    // Skip changes during initial data load
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
          const { elements, appState, files } = res.data.data;
          if (elements || appState) {
            setInitialData({
              elements: elements || [],
              appState: appState || {},
            });

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
      {/* Subtle auto-save status indicator */}
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
