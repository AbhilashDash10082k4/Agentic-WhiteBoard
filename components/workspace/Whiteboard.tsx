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
import {
  getRightmostPlacementPosition,
  appendElementsToCanvas,
  replacePlaceholderWithGeneratedElements,
  createAIGenerationPlaceholderElements,
  convertToElements,
} from "@/components/workspace/ai-chat/ai-canvas-generator";
import { useCanvasAutoSave } from "../../hooks/use-canvas-autosave";
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

  const [activeTool, setActiveTool] = React.useState<string>("selection");
  const [apiReady, setApiReady] = React.useState<any>(null);
  const [selectedElement, setSelectedElement] = React.useState<any>(null);
  const [floatingPos, setFloatingPos] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const [zoom, setZoom] = React.useState<number>(100);
  const [chatMode, setChatMode] = React.useState<
    "closed" | "popover" | "sidebar"
  >("closed");
  const [activeSidekick, setActiveSidekick] = React.useState<string>("general");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { resolvedTheme } = useTheme();

  // Close chat when clicking outside
  React.useEffect(() => {
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

  const handleExcalidrawAPI = React.useCallback(
    (api: any) => {
      excalidrawAPIRef.current = api;
      setApiReady((prev: any) => (prev === api ? prev : api));
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

  React.useEffect(() => {
    if (excalidrawAPIRef.current && resolvedTheme) {
      const target = resolvedTheme === "dark" ? "dark" : "light";
      if (excalidrawAPIRef.current.getAppState()?.theme !== target) {
        excalidrawAPIRef.current.updateScene({ appState: { theme: target } });
      }
    }
  }, [resolvedTheme, excalidrawAPIRef]);

  const handleZoomIn = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({
      appState: { zoom: { value: Math.min(3, cur + 0.1) } },
    });
  }, [excalidrawAPIRef]);

  const handleZoomOut = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    const cur = excalidrawAPIRef.current.getAppState()?.zoom?.value ?? 1;
    excalidrawAPIRef.current.updateScene({
      appState: { zoom: { value: Math.max(0.1, cur - 0.1) } },
    });
  }, [excalidrawAPIRef]);

  const handleResetZoom = React.useCallback(() => {
    if (!excalidrawAPIRef.current) return;
    excalidrawAPIRef.current.updateScene({ appState: { zoom: { value: 1 } } });
  }, [excalidrawAPIRef]);

  const handleNewChat = React.useCallback(() => {
    setMessages([]);
    setActiveSidekick("general");
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
  }, []);

  const handleGenerateDiagram = React.useCallback(
    async ({
      diagramType,
      prompt,
      apiKey,
      provider = "gemini",
    }: {
      diagramType: string;
      prompt: string;
      apiKey: string;
      provider: "gemini" | "openai";
    }) => {
      if (!excalidrawAPIRef.current) return;
      setIsGenerating(true);

      const existing =
        excalidrawAPIRef.current.getSceneElementsIncludingDeleted();
      const pos = getRightmostPlacementPosition(existing, 80);

      const placeholderId = `ai-placeholder-${Date.now()}`;
      const placeholderElements = await createAIGenerationPlaceholderElements(
        pos.x,
        pos.y,
        `Generating ${diagramType}`,
      );
      appendElementsToCanvas(excalidrawAPIRef.current, placeholderElements);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: `Generate ${diagramType}: ${prompt}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const res = await axios.post("/api/ai/generate", {
          apiKey,
          provider,
          prompt,
          diagramType,
          position: pos,
        });

        const diagramPayload = res.data?.data;
        if (res.data?.success && diagramPayload?.elements) {
          const converted = await convertToElements(diagramPayload.elements);
          replacePlaceholderWithGeneratedElements(
            excalidrawAPIRef.current,
            placeholderId,
            converted,
          );

          const generatedTitle = diagramPayload.title || diagramType;
          const assistantMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Successfully generated ${generatedTitle} on canvas.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, assistantMsg]);

          toast({
            title: "Diagram Generated",
            description: `Generated ${generatedTitle} on canvas.`,
            variant: "success",
          });
        } else {
          throw new Error(res.data?.message || "Failed to generate diagram.");
        }
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message || err?.message || "Generation failed";
        const failMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Error: ${errorMsg}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, failMsg]);
        toast({
          title: "Generation Error",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [excalidrawAPIRef],
  );

  const handleCanvasChange = React.useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (appState?.activeTool?.type) {
        setActiveTool((prev) =>
          prev === appState.activeTool.type ? prev : appState.activeTool.type,
        );
      }
      if (appState?.zoom?.value) {
        const cz = Math.round(appState.zoom.value * 100);
        setZoom((prev) => (prev === cz ? prev : cz));
      }

      const selectedIds = Object.keys(
        appState?.selectedElementIds || {},
      ).filter((id) => appState.selectedElementIds[id]);
      if (selectedIds.length === 1) {
        const el = elements.find(
          (item: any) => item.id === selectedIds[0] && !item.isDeleted,
        );
        if (el) {
          const z = appState.zoom?.value ?? 1;
          const sx = (el.x + (appState.scrollX ?? 0)) * z;
          const sy = (el.y + (appState.scrollY ?? 0)) * z;
          const tx = Math.round(Math.max(16, sx));
          const ty = Math.round(Math.max(70, sy - 54));
          setSelectedElement((prev: any) =>
            prev?.id === el.id && prev?.version === el.version ? prev : el,
          );
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
        onSelectTool={setActiveTool}
      />
      <FloatingToolBar
        selectedElement={selectedElement}
        position={floatingPos}
        excalidrawAPI={apiReady}
        onClose={() => {
          setSelectedElement(null);
          setFloatingPos(null);
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
        zoom={zoom}
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
