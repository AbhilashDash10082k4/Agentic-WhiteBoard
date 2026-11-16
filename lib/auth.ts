import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "node:crypto";

export interface AuthenticatedUser {
  clerkUserId: string;
  userUuid: string;
  email: string;
  name: string;
}

export type AuthResult =
  | { user: AuthenticatedUser; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse };

// Deterministically convert Clerk user ID to UUID v5 format for DB foreign keys
export function getClerkUserUuid(clerkId: string): string {
  const hash = crypto.createHash("sha1").update(`clerk:${clerkId}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

// Reusable user authentication guard for Next.js Route Handlers
export async function requireAuthUser(): Promise<AuthResult> {
  const clerkUser = await currentUser();
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!clerkUser || !userEmail) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Unauthorized: Active Clerk session required",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, private",
          },
        }
      ),
    };
  }

  return {
    user: {
      clerkUserId: clerkUser.id,
      userUuid: getClerkUserUuid(clerkUser.id),
      email: userEmail,
      name: clerkUser.fullName || clerkUser.firstName || "User",
    },
  };
}

