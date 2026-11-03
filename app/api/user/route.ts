import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  if (user && email) {
    // Check if user already exists
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (userData.length > 0) {
      return NextResponse.json(userData[0]);
    }

    // Insert new user into database
    const res = await db
      .insert(users)
      .values({
        name: user.fullName ?? "",
        email: email,
      })
      .returning();

    return NextResponse.json(res[0]);
  }

  return NextResponse.json({ message: "USER not found" }, { status: 401 });
}
