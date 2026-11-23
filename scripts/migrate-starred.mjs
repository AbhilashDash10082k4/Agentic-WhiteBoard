import { neon } from "@neondatabase/serverless";

const databaseUrl = "postgresql://neondb_owner:npg_kxQ8BFlz7wnu@ep-icy-mountain-aogzvpyg.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const sql = neon(databaseUrl);
  try {
    await sql`ALTER TABLE "boards" ADD COLUMN IF NOT EXISTS "is_starred" boolean DEFAULT false NOT NULL;`;
    console.log("Column is_starred ensured on boards table.");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

main();
