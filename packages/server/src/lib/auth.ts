import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "../db/client";
import {
  users,
  sessions,
  accounts,
  verifications,
} from "@siege/shared/db-schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  basePath: "/",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-change-in-production",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { user: users, session: sessions, account: accounts, verification: verifications },
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  plugins: [username()],
  trustedOrigins: [
    "http://localhost:*",
    "http://127.0.0.1:*",
    process.env.APP_URL ?? "",
  ].filter(Boolean),
});
