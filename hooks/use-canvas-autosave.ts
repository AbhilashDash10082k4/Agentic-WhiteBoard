"use client";

import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { repairFractionalIndicesAndBindings } from "@/components/workspace/fractional-index-helper";
import { useCallback, useEffect, useRef, useState } from "react";

export function sanitizeElements(elements: any[]): any[] {
  if (!Array.isArray(elements)) return [];
  const basic = elements.filter(Boolean).map((el) => {
    const isLinear = el.type === "arrow" || el.type === "line";
    return {
      ...el,
      groupIds: Array.isArray(el.groupIds) ? el.groupIds : [],
      boundElements: Array.isArray(el.boundElements) ? el.boundElements : [],
      points:
        isLinear && Array.isArray(el.points) && el.points.length > 0
          ? el.points
          : isLinear
            ? [
                [0, 0],
                [0, 0],
              ]
            : el.points,
      isDeleted: Boolean(el.isDeleted),
    };
  });
  return repairFractionalIndicesAndBindings(basic);
}

export function getCanvasSignature(
  elements: readonly any[],
  appState: any,
  files?: Record<string, any>,
): string {
  const elTokens = (elements || [])
    .filter((e) => !e.isDeleted)
    .map(
      (e) =>
        `${e.id}:${e.version}:${e.x}:${e.y}:${e.width}:${e.height}:${e.strokeColor}:${e.backgroundColor}:${e.fileId || ""}`,
    )
    .join(";");
  const fileTokens = files ? Object.keys(files).sort().join(",") : "";
  return `${elTokens}|bg:${appState?.viewBackgroundColor || ""}|files:${fileTokens}`;
}

export function useCanvasAutoSave(boardId: string) {
  const [mounted, setMounted] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const excalidrawAPIRef = useRef<any>(null);
  const filesRef = useRef<Record<string, any>>({});
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentVersionRef = useRef<number>(1);
  const lastSavedSigRef = useRef<string>("");
  const latestDataRef = useRef<any>(null);
  const isInitialLoadRef = useRef(true);

  const saveCanvasChanges = useCallback(async () => {
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
      allFiles,
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
        currentVersionRef.current =
          res.data.data.version ?? currentVersionRef.current + 1;
        lastSavedSigRef.current = currentSig;
        filesRef.current = allFiles;
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }
    } catch (error: any) {
      setSaveStatus("idle");
      toast({
        title:
          error?.response?.status === 409 ? "Sync Conflict" : "Save failed",
        description:
          error?.response?.status === 409
            ? "Newer version on server."
            : "Could not auto-save canvas changes.",
        variant: "destructive",
      });
    }
  }, [boardId]);

  const scheduleAutoSave = useCallback(
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
    [saveCanvasChanges],
  );

  useEffect(() => {
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
            const sanitized = sanitizeElements(elements);
            setInitialData({
              elements: sanitized,
              appState: appState || {},
              files: loadedFiles,
            });
            lastSavedSigRef.current = getCanvasSignature(
              sanitized,
              appState || {},
              loadedFiles,
            );

            if (excalidrawAPIRef.current) {
              excalidrawAPIRef.current.updateScene({
                elements: sanitized,
                appState: appState || {},
              });
              if (
                Object.keys(loadedFiles).length > 0 &&
                excalidrawAPIRef.current.addFiles
              ) {
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
