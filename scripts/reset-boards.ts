import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Drop half-created boards table to clear type mismatch conflicts
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const sql = neon(url);
  console.log("Dropping existing boards table...");
  await sql`DROP TABLE IF EXISTS boards CASCADE;`;
  console.log("Table boards dropped successfully! Now run: bun run db:push");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

