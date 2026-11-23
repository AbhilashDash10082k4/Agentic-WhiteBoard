"use client";

import * as React from "react";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { ChatMessage } from "@/components/workspace/ai-chat/ai-chat-types";
import {
  getRightmostPlacementPosition,
  appendElementsToCanvas,
  replacePlaceholderWithGeneratedElements,
  createAIGenerationPlaceholderElements,
  convertToElements,
} from "@/components/workspace/ai-chat/ai-canvas-generator";

export function useDiagramGenerator(
  excalidrawAPIRef: React.RefObject<any>,
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateDiagram = React.useCallback(
    async ({
      diagramType,
      prompt,
      apiKey,
      provider = "google",
      credentialId,
    }: {
      diagramType: string;
      prompt: string;
      apiKey?: string;
      provider?: string;
      credentialId?: string;
    }) => {
      const api = excalidrawAPIRef.current;
      if (!api) return;
      setIsGenerating(true);

      const existing = api.getSceneElementsIncludingDeleted();
      const pos = getRightmostPlacementPosition(existing, 80);

      const placeholderId = `ai-placeholder-${Date.now()}`;
      const placeholderElements = await createAIGenerationPlaceholderElements(
        pos.x,
        pos.y,
        `Generating ${diagramType}`
      );
      appendElementsToCanvas(api, placeholderElements);

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
          credentialId,
          provider,
          prompt,
          diagramType,
          position: pos,
        });

        const diagramPayload = res.data?.data;
        if (res.data?.success && diagramPayload?.elements) {
          const converted = await convertToElements(diagramPayload.elements);
          replacePlaceholderWithGeneratedElements(api, placeholderId, converted);

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
    [excalidrawAPIRef, setMessages]
  );

  return { isGenerating, handleGenerateDiagram };
}

