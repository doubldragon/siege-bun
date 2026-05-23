import { Elysia } from "elysia";
import { db } from "../db/client";
import { users } from "@siege/shared/db-schema";
import { eq } from "drizzle-orm";
import { withSession } from "../lib/auth-middleware";

export const userRoutes = new Elysia({ prefix: "/api" })
  .use(withSession)
  .get("/user", async ({ user, status }) => {
    if (!user) return status(401, { message: "Unauthorized" });

    const [dbUser] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!dbUser) return status(404, { message: "User not found" });
    return dbUser;
  });
