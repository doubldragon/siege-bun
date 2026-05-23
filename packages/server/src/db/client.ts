import { drizzle as drizzleBun } from "drizzle-orm/bun-sqlite";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { Database } from "bun:sqlite";
import { createClient } from "@libsql/client";
import * as schema from "@siege/shared/db-schema";

const url = process.env.DATABASE_URL ?? "";

export const isLibsql =
  url.startsWith("libsql://") || url.startsWith("https://");

export const db = isLibsql
  ? drizzleLibsql(
      createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN }),
      { schema }
    )
  : drizzleBun(
      new Database(url.replace("file:", "") || "siege.db"),
      { schema }
    );
