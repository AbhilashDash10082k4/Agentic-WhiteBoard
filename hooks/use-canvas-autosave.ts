"use client";

import * as React from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";

export function getCanvasSignature(
  elements: readonly any[],
  appState: any,
  files?: Record<string, any>
): string {
  const elTokens = (elements || [])
    .filter((e) => !e.isDeleted)
    .map(
      (e) =>
        `${e.id}:${e.version}:${e.x}:${e.y}:${e.width}:${e.height}:${e.strokeColor}:${e.backgroundColor}:${e.fileId || ""}`
    )
    .join(";");
  const fileTokens = files ? Object.keys(files).sort().join(",") : "";
  return `${elTokens}|bg:${appState?.viewBackgroundColor || ""}|files:${fileTokens}`;
}

export function useCanvasAutoSave(boardId: string) {
  const [mounted, setMounted] = React.useState(false);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");

  const excalidrawAPIRef = React.useRef<any>(null);
  const filesRef = React.useRef<Record<string, any>>({});
  const saveTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentVersionRef = React.useRef<number>(1);
  const lastSavedSigRef = React.useRef<string>("");
  const latestDataRef = React.useRef<any>(null);
  const isInitialLoadRef = React.useRef(true);

  const saveCanvasChanges = React.useCallback(async () => {
    if (!latestDataRef.current || !boardId) return;

    const sceneFiles = excalidrawAPIRef.current?.getFiles
      ? excalidrawAPIRef.current.getFiles()
      : {};
    const allFiles = {
      ...filesRef.current,
      ...sceneFiles,
      ...(latestDataRef.current.files || {}),
    };

    const currentSig = getCanvasSignature(
      latestDataRef.current.elements,
      latestDataRef.current.appState,
      allFiles
    );
    if (currentSig === lastSavedSigRef.current) return;

    setSaveStatus("saving");
    try {
      const res = await axios.post("/api/board/data", {
        boardId,
        version: currentVersionRef.current,
        elements: latestDataRef.current.elements,
        appState: latestDataRef.current.appState,
        files: allFiles,
      });

      if (res.data?.success && res.data?.data) {
        currentVersionRef.current = res.data.data.version ?? currentVersionRef.current + 1;
        lastSavedSigRef.current = currentSig;
        filesRef.current = allFiles;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (error: any) {
      setSaveStatus("idle");
      toast({
        title: error?.response?.status === 409 ? "Sync Conflict" : "Save failed",
        description:
          error?.response?.status === 409
            ? "Newer version on server."
            : "Could not auto-save canvas changes.",
        variant: "destructive",
      });
    }
  }, [boardId]);

  const scheduleAutoSave = React.useCallback(
    (elements: readonly any[], appState: any, files: any) => {
      if (isInitialLoadRef.current) return;

      const sceneFiles = excalidrawAPIRef.current?.getFiles
        ? excalidrawAPIRef.current.getFiles()
        : {};
      const mergedFiles = {
        ...filesRef.current,
        ...sceneFiles,
        ...(files || {}),
      };
      filesRef.current = mergedFiles;

      latestDataRef.current = { elements, appState, files: mergedFiles };

      const currentSig = getCanvasSignature(elements, appState, mergedFiles);
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

          const loadedFiles = files && typeof files === "object" ? files : {};
          filesRef.current = { ...loadedFiles };

          if (elements || appState || Object.keys(loadedFiles).length > 0) {
            setInitialData({
              elements: elements || [],
              appState: appState || {},
              files: loadedFiles,
            });
            lastSavedSigRef.current = getCanvasSignature(
              elements || [],
              appState || {},
              loadedFiles
            );

            if (excalidrawAPIRef.current) {
              excalidrawAPIRef.current.updateScene({
                elements: elements || [],
                appState: appState || {},
              });
              if (Object.keys(loadedFiles).length > 0 && excalidrawAPIRef.current.addFiles) {
                excalidrawAPIRef.current.addFiles(Object.values(loadedFiles));
              }
            }
          }
        }
      } catch {
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

  return {
    mounted,
    initialData,
    saveStatus,
    filesRef,
    excalidrawAPIRef,
    scheduleAutoSave,
  };
}
