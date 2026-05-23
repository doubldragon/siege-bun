import { db } from "../src/db/client";
import { users } from "@siege/shared/db-schema";
import { eq } from "drizzle-orm";

const username = process.argv[2];
if (!username) {
  console.error("Usage: bun run promote-admin <username>");
  process.exit(1);
}

const [user] = await db
  .update(users)
  .set({ isAdmin: true })
  .where(eq(users.username, username))
  .returning({ id: users.id, username: users.username });

if (!user) {
  console.error(`User "${username}" not found`);
  process.exit(1);
}

console.log(`✓ ${user.username} is now an admin`);
