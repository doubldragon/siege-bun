import type { Config } from "drizzle-kit";

export default {
  schema: "../shared/src/db-schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "siege.db",
  },
} satisfies Config;
