import {
  DIAGRAM_PROMPT_CONFIGS,
  getDiagramPromptConfig,
} from "@/components/workspace/ai-chat/ai-prompt-configs";
import { credentialService } from "@/services/credential.service";

export interface GenerateDiagramDTO {
  apiKey?: string;
  credentialId?: string;
  userId?: string;
  provider?: string;
  prompt: string;
  diagramType: string;
  position?: { x: number; y: number };
}

export interface GeneratedDiagramResponse {
  elements: any[];
  title?: string;
}

// Service handling AI diagram generation via external LLM APIs (Gemini / OpenAI)
export class AIService {
  // Generate diagram element skeletons using user-provided API key or Credential Vault
  async generateDiagram(
    dto: GenerateDiagramDTO,
  ): Promise<GeneratedDiagramResponse> {
    let resolvedKey = dto.apiKey?.trim();
    let resolvedProvider = (dto.provider || "gemini").toLowerCase();

    // Resolve from Credential Vault if credentialId provided
    if (dto.credentialId && dto.userId) {
      const cred = await credentialService.getDecryptedCredential(
        dto.credentialId,
        dto.userId,
      );
      resolvedKey = cred.apiKey;
    }

    if (!resolvedKey) {
      throw new Error(
        "API key is required. Please provide an API key or configure a Credential Vault key.",
      );
    }
    if (!dto.prompt || !dto.prompt.trim()) {
      throw new Error("Prompt is required to generate a diagram.");
    }

    const config =
      getDiagramPromptConfig(dto.diagramType) ||
      DIAGRAM_PROMPT_CONFIGS["generate-diagram"];
    const startX = dto.position?.x ?? 200;
    const startY = dto.position?.y ?? 150;

    const systemInstruction = `${config.systemPrompt}
CRITICAL REQUIREMENTS:
1. Generate valid JSON array of Excalidraw element skeleton objects compatible with convertToExcalidrawElements.
2. Output ONLY the JSON array (or an object with an "elements" array property). No markdown, no commentary.
3. Base coordinates: place starting elements near X: ${startX}, Y: ${startY}.
4. Element types allowed: "rectangle", "ellipse", "diamond", "arrow", "line", "text".
5. Every shape should have type, x, y, width, height, strokeColor, backgroundColor, fillStyle ("solid"|"hachure"), strokeWidth, label { text, fontSize, textAlign, verticalAlign }.
6. Arrows must include points array, e.g. points: [[0, 0], [dx, dy]].`;

    const rawJsonText =
      resolvedProvider === "openai"
        ? await this.callOpenAI(resolvedKey, systemInstruction, dto.prompt)
        : await this.callGemini(resolvedKey, systemInstruction, dto.prompt);

    const parsedElements = this.parseAndSanitizeElements(
      rawJsonText,
      startX,
      startY,
      config.name,
    );

    return {
      elements: parsedElements,
      title: config.name,
    };
  }

  // Call Google Gemini API
  private async callGemini(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(
        `Gemini API error (${res.status}): ${errBody || res.statusText}`,
      );
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("Gemini API returned an empty response.");
    }
    return candidateText;
  }

  // Call OpenAI API
  private async callOpenAI(
    apiKey: string,
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const url = "https://api.openai.com/v1/chat/completions";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      throw new Error(
        `OpenAI API error (${res.status}): ${errBody || res.statusText}`,
      );
    }

    const data = await res.json();
    const messageContent = data?.choices?.[0]?.message?.content;
    if (!messageContent) {
      throw new Error("OpenAI API returned an empty response.");
    }
    return messageContent;
  }

  // Parse raw LLM output into Excalidraw element skeletons
  private parseAndSanitizeElements(
    rawText: string,
    fallbackX: number,
    fallbackY: number,
    fallbackTitle: string,
  ): any[] {
    let cleaned = rawText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(
        "Failed to parse LLM response as JSON Excalidraw elements.",
      );
    }

    const rawArray = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.elements)
        ? parsed.elements
        : Array.isArray(parsed.diagram)
          ? parsed.diagram
          : null;

    if (!rawArray || rawArray.length === 0) {
      return [
        {
          type: "rectangle",
          x: fallbackX,
          y: fallbackY,
          width: 300,
          height: 140,
          strokeColor: "#9333ea",
          backgroundColor: "#faf5ff",
          fillStyle: "solid",
          strokeWidth: 2,
          roughness: 1,
          label: {
            text: `${fallbackTitle}\n\nGenerated with AI`,
            fontSize: 16,
            textAlign: "center",
            verticalAlign: "middle",
          },
        },
      ];
    }

    return rawArray.map((el, i) => ({
      id: el.id || `ai-${Date.now()}-${i}`,
      type: el.type || "rectangle",
      x: typeof el.x === "number" ? el.x : fallbackX + (i % 3) * 240,
      y: typeof el.y === "number" ? el.y : fallbackY + Math.floor(i / 3) * 160,
      width: el.width || 220,
      height: el.height || 100,
      strokeColor: el.strokeColor || "#2563eb",
      backgroundColor: el.backgroundColor || "#eff6ff",
      fillStyle: el.fillStyle || "solid",
      strokeWidth: el.strokeWidth || 2,
      strokeStyle: el.strokeStyle || "solid",
      roughness: typeof el.roughness === "number" ? el.roughness : 1,
      roundness: el.roundness ?? { type: 3 },
      points: el.points,
      label:
        el.label || (el.text ? { text: el.text, fontSize: 14 } : undefined),
    }));
  }
}

export const aiService = new AIService();

/**[caveman](slashCommand;caveman) Solve these issues-
 */
