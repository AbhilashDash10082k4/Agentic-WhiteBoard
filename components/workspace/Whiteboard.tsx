"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { Loader2, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "@/hooks/use-toast";
import { CanvasToolbar } from "@/components/workspace/canvas-toolbar";
import { CanvasBottomBar } from "@/components/workspace/canvas-bottom-bar";
import { FloatingToolBar } from "@/components/workspace/FloatingToolBar";
import { AIChatPopover } from "@/components/workspace/ai-chat/ai-chat-popover";
import { AIChatSidebar } from "@/components/workspace/ai-chat/ai-chat-sidebar";
import { ChatMessage } from "@/components/workspace/ai-chat/ai-chat-types";
import "@excalidraw/excalidraw/index.css";
import "./whiteboard.css";

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

const UI_OPTIONS = {
  canvasActions: { loadScene: false, export: { saveFileToDisk: true }, saveAsImage: true },
};

function getCanvasSignature(elements: readonly any[], appState: any): string {
  const elTokens = (elements || [])
    .filter((e) => !e.isDeleted)
    .map((e) => `${e.id}:${e.version}:${e.x}:${e.y}:${e.width}:${e.height}:${e.strokeColor}:${e.backgroundColor}`)
    .join(";");
  return `${elTokens}|bg:${appState?.viewBackgroundColor || ""}`;
}

interface WhiteboardProps {
  boardId: string;
  isSidebarOpen?: boolean;
}

export function Whiteboard({ boardId, isSidebarOpen = false }: WhiteboardProps) {
  const [mounted, setMounted] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [activeTool, setActiveTool] = React.useState<string>("selection");
  const [apiReady, setApiReady] = React.useState<any>(null);
  const [selectedElement, setSelectedElement] = React.useState<any>(null);
  const [floatingPos, setFloatingPos] = React.useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = React.useState<number>(100);
  const [chatMode, setChatMode] = React.useState<"closed" | "popover" | "sidebar">("closed");
  const [activeSidekick, setActiveSidekick] = React.useState<string>("general");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "init-1",
      role: "assistant",
      content:
        "Key design principles applied:\n\n• Horizontal scalability via stateless services and read replicas\n• Defense in depth with WAF, gateway auth, and rate limiting at perimeter\n• Polyglot persistence matching data access patterns\n• Event-driven decoupling via Kafka\n• Full observability with RED method (Rate, Errors, Duration)\n\nContent placed left of existing board. Would you like to drill deeper, add a sequence diagram, or create an RFC?",
      timestamp: new Date(),
    },
  ]);

  const { resolvedTheme } = useTheme();
  const excalidrawAPIRef = React.useRef<any>(null);
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentVersionRef = React.useRef<number>(1);
  const lastSavedSigRef = React.useRef<string>("");
  const latestDataRef = React.useRef<any>(null);
  const isInitialLoadRef = React.useRef(true);

  const handleExcalidrawAPI = React.useCallback((api: any) => {
    excalidrawAPIRef.current = api;
    setApiReady((prev: any) => (prev === api ? prev : api));
  }, []);

  React.useEffect(() => {
    if (excalidrawAPIRef.current && resolvedTheme) {
      const target = resolvedTheme === "dark" ? "dark" : "light";
      if (excalidrawAPIRef.current.getAppState()?.theme !== target) {
        excalidrawAPIRef.current.updateScene({ appState: { theme: target } });
      }
    }
  }, [resolvedTheme]);

  const handleZoomIn = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({ appState: { zoom: { value: Math.min(3, cur + 0.1) } } });
  }, []);

  const handleZoomOut = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({ appState: { zoom: { value: Math.max(0.1, cur - 0.1) } } });
  }, []);

  const handleResetZoom = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    excalidrawAPIRef.current.updateScene({ appState: { zoom: { value: 1 } } });
  }, []);

  const handleSendMessage = React.useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatMode("sidebar");

    // Automated smart assistant response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I've prepared the recommendations for "${text}".\n\n• Architecture models updated on canvas.\n• Microservice boundaries established.\n• You can review the updated components on the left.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 700);
  }, []);

  const saveCanvasChanges = React.useCallback(async () => {
    if (!latestDataRef.current || !boardId) return;
    const currentSig = getCanvasSignature(latestDataRef.current.elements, latestDataRef.current.appState);
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
        currentVersionRef.current = res.data.data.version ?? currentVersionRef.current + 1;
        lastSavedSigRef.current = currentSig;
        setSaveStatus("saved");
        toast({ title: "Canvas saved", description: `Board synced (v${currentVersionRef.current}).`, variant: "success" });
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (error: any) {
      setSaveStatus("idle");
      toast({
        title: error?.response?.status === 409 ? "Sync Conflict" : "Save failed",
        description: error?.response?.status === 409 ? "Newer version on server." : "Could not auto-save canvas changes.",
        variant: "destructive",
      });
    }
  }, [boardId]);

  const handleCanvasChange = React.useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (appState?.activeTool?.type) {
        setActiveTool((prev) => (prev === appState.activeTool.type ? prev : appState.activeTool.type));
      }
      if (appState?.zoom?.value) {
        const cz = Math.round(appState.zoom.value * 100);
        setZoom((prev) => (prev === cz ? prev : cz));
      }

      const selectedIds = Object.keys(appState?.selectedElementIds || {}).filter((id) => appState.selectedElementIds[id]);
      if (selectedIds.length === 1) {
        const el = elements.find((item: any) => item.id === selectedIds[0] && !item.isDeleted);
        if (el) {
          const z = appState.zoom?.value ?? 1;
          const sx = (el.x + (appState.scrollX ?? 0)) * z;
          const sy = (el.y + (appState.scrollY ?? 0)) * z;
          const tx = Math.round(Math.max(16, sx));
          const ty = Math.round(Math.max(70, sy - 54));
          setSelectedElement((prev: any) => (prev?.id === el.id && prev?.version === el.version ? prev : el));
          setFloatingPos((prev) => (prev && prev.x === tx && prev.y === ty ? prev : { x: tx, y: ty }));
        } else {
          setSelectedElement(null);
          setFloatingPos(null);
        }
      } else {
        setSelectedElement(null);
        setFloatingPos(null);
      }

      if (isInitialLoadRef.current) return;
      latestDataRef.current = { elements, appState, files };

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

  React.useEffect(() => {
    let isMounted = true;
    async function loadBoardData() {
      try {
        const res = await axios.get(`/api/board/data?boardId=${boardId}`);
        if (res.data?.success && res.data?.data && isMounted) {
          const { elements, appState, files, version } = res.data.data;
          if (version) currentVersionRef.current = version;
          if (elements || appState) {
            setInitialData({ elements: elements || [], appState: appState || {} });
            lastSavedSigRef.current = getCanvasSignature(elements || [], appState || {});
            if (excalidrawAPIRef.current) {
              excalidrawAPIRef.current.updateScene({ elements: elements || [], appState: appState || {} });
              if (files && excalidrawAPIRef.current.addFiles) excalidrawAPIRef.current.addFiles(Object.values(files));
            }
          }
        }
      } catch {} finally {
        if (isMounted) {
          setMounted(true);
          setTimeout(() => { isInitialLoadRef.current = false; }, 1000);
        }
      }
    }
    if (boardId) loadBoardData();
    return () => { isMounted = false; if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [boardId]);

  if (!mounted) {
    return (
      <div className="flex size-full items-center justify-center bg-muted/10">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative size-full pt-14 bg-background overflow-hidden">
      <CanvasToolbar excalidrawAPI={apiReady} activeTool={activeTool} isSidebarOpen={isSidebarOpen} onSelectTool={setActiveTool} />
      <FloatingToolBar selectedElement={selectedElement} position={floatingPos} excalidrawAPI={apiReady} onClose={() => { setSelectedElement(null); setFloatingPos(null); }} />

      {/* Floating AI Chat Popover (Pic 1, 2, 5) */}
      <AIChatPopover
        isOpen={chatMode === "popover"}
        activeSidekick={activeSidekick}
        onSelectSidekick={setActiveSidekick}
        onOpenSidePanel={() => setChatMode("sidebar")}
        onClose={() => setChatMode("closed")}
        onSendMessage={handleSendMessage}
      />

      {/* Docked AI Side Panel (Pic 3, 4) */}
      <AIChatSidebar
        isOpen={chatMode === "sidebar"}
        messages={messages}
        activeSidekick={activeSidekick}
        onSelectSidekick={setActiveSidekick}
        onRestorePopover={() => setChatMode("popover")}
        onClose={() => setChatMode("closed")}
        onSendMessage={handleSendMessage}
      />

      {/* Miro-style Bottom Bar & Zoom Controls */}
      <CanvasBottomBar
        zoom={zoom}
        isSidebarOpen={isSidebarOpen}
        isChatOpen={chatMode === "popover"}
        onOpenChat={() => setChatMode("popover")}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
      />

      {/* Auto-save status badge */}
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
