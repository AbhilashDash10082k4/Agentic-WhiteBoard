import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { aiService, AIService } from "@/services/ai.service";

// Controller controlling request input, validation, and diagram generation output
export class AIController {
  constructor(private readonly service: AIService = aiService) {}

  // Handle POST /api/ai/generate (generates Excalidraw JSON diagram using API key or Credential Vault)
  async handleGenerateDiagram(req: NextRequest): Promise<NextResponse> {
    try {
      let body: any = {};
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON request body." },
          { status: 400 }
        );
      }

      const { apiKey, credentialId, provider, prompt, diagramType, position } = body;

      let userId: string | undefined;
      if (credentialId) {
        const auth = await requireAuthUser();
        if (auth.errorResponse) return auth.errorResponse;
        userId = auth.user.userUuid;
      } else if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing API key. Please provide an API key or select a stored credential.",
          },
          { status: 400 }
        );
      }

      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "Missing prompt. Please enter a description of what to generate.",
          },
          { status: 400 }
        );
      }

      const result = await this.service.generateDiagram({
        apiKey: apiKey?.trim(),
        credentialId,
        userId,
        provider: provider?.toLowerCase(),
        prompt: prompt.trim(),
        diagramType: diagramType || "generate-diagram",
        position,
      });

      return NextResponse.json(
        {
          success: true,
          data: result,
        },
        { status: 200 }
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 500 }
      );
    }
  }
}

export const aiController = new AIController();
