import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (user) {
    const userData = await db
      .select()
      .from(users)
      .where(eq(user.primaryEmailAddress?.emailAddress, users.email));
    if (userData.length > 0) {
      return NextResponse.json(userData[0]);
    } else {
      const res = await db
        .insert(users)
        .values({
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress ?? "",
        })
        .returning();
      return NextResponse.json(res[0]);
    }
  }
  return NextResponse.json({ message: "USER not found" });
}
