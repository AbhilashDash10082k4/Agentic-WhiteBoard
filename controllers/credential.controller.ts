import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthUser } from "@/lib/auth";
import {
  credentialService,
  CredentialService,
} from "@/services/credential.service";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  Expires: "0",
};

// Zod schemas enforcing strict validation on all endpoints
export const CreateCredentialSchema = z.object({
  provider: z.string().trim().min(1, "Provider is required").toLowerCase(),
  label: z.string().trim().min(1, "Label is required").max(100),
  apiKey: z.string().trim().min(1, "API Key is required"),
  endpointUrl: z
    .string()
    .trim()
    .url("Invalid endpoint URL")
    .optional()
    .or(z.literal("")),
  organizationId: z.string().trim().optional(),
});

export const UpdateCredentialSchema = z.object({
  label: z.string().trim().min(1).max(100).optional(),
  apiKey: z.string().trim().min(1).optional(),
  endpointUrl: z
    .string()
    .trim()
    .url("Invalid endpoint URL")
    .optional()
    .or(z.literal("")),
  organizationId: z.string().trim().optional(),
});

export const CredentialIdSchema = z
  .string()
  .uuid("Invalid credential ID format (UUID required)");

export class CredentialController {
  constructor(
    private readonly service: CredentialService = credentialService,
  ) {}

  // GET /api/credentials - list all safe credential metadata for user
  async handleListCredentials(): Promise<NextResponse> {
    try {
      const auth = await requireAuthUser();
      if (auth.errorResponse) return auth.errorResponse;

      const credentials = await this.service.listUserCredentials(
        auth.user.userUuid,
      );
      return NextResponse.json(
        { success: true, data: credentials },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, message },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }
  }

  // POST /api/credentials - create new encrypted credential
  async handleCreateCredential(req: NextRequest): Promise<NextResponse> {
    try {
      const auth = await requireAuthUser();
      if (auth.errorResponse) return auth.errorResponse;

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON request body" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const parsed = CreateCredentialSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const safeMetadata = await this.service.saveCredential({
        userId: auth.user.userUuid,
        userEmail: auth.user.email,
        provider: parsed.data.provider,
        label: parsed.data.label,
        config: {
          apiKey: parsed.data.apiKey,
          endpointUrl: parsed.data.endpointUrl || undefined,
          organizationId: parsed.data.organizationId || undefined,
        },
      });

      return NextResponse.json(
        { success: true, data: safeMetadata },
        { status: 201, headers: NO_STORE_HEADERS },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, message },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }
  }

  // PUT /api/credentials/[id] - replace / update credential
  async handleUpdateCredential(
    req: NextRequest,
    rawId: string,
  ): Promise<NextResponse> {
    try {
      const auth = await requireAuthUser();
      if (auth.errorResponse) return auth.errorResponse;

      const idParsed = CredentialIdSchema.safeParse(rawId);
      if (!idParsed.success) {
        return NextResponse.json(
          { success: false, message: "Invalid credential ID format" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid JSON request body" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const parsed = UpdateCredentialSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors,
          },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const updated = await this.service.updateCredential({
        credentialId: idParsed.data,
        userId: auth.user.userUuid,
        label: parsed.data.label,
        config: parsed.data.apiKey
          ? {
              apiKey: parsed.data.apiKey,
              endpointUrl: parsed.data.endpointUrl || undefined,
              organizationId: parsed.data.organizationId || undefined,
            }
          : undefined,
      });

      return NextResponse.json(
        { success: true, data: updated },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, message },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }
  }

  // DELETE /api/credentials/[id] - delete/revoke credential
  async handleDeleteCredential(rawId: string): Promise<NextResponse> {
    try {
      const auth = await requireAuthUser();
      if (auth.errorResponse) return auth.errorResponse;

      const idParsed = CredentialIdSchema.safeParse(rawId);
      if (!idParsed.success) {
        return NextResponse.json(
          { success: false, message: "Invalid credential ID format" },
          { status: 400, headers: NO_STORE_HEADERS },
        );
      }

      const success = await this.service.deleteCredential(
        idParsed.data,
        auth.user.userUuid,
      );
      if (!success) {
        return NextResponse.json(
          { success: false, message: "Credential not found or unauthorized" },
          { status: 404, headers: NO_STORE_HEADERS },
        );
      }

      return NextResponse.json(
        { success: true, message: "Credential deleted successfully" },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, message },
        { status: 500, headers: NO_STORE_HEADERS },
      );
    }
  }

  // GET /api/credentials/providers - list supported providers
  handleListProviders(): NextResponse {
    const providers = this.service.getSupportedProviders();
    return NextResponse.json(
      { success: true, data: providers },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  }
}

export const credentialController = new CredentialController();
