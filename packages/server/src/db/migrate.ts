import { migrate as migrateBun } from "drizzle-orm/bun-sqlite/migrator";
import { migrate as migrateLibsql } from "drizzle-orm/libsql/migrator";
import { db, isLibsql } from "./client";
import { join } from "path";

const migrationsFolder = join(import.meta.dir, "migrations");

if (isLibsql) {
  await migrateLibsql(db as Parameters<typeof migrateLibsql>[0], {
    migrationsFolder,
  });
} else {
  await migrateBun(db as Parameters<typeof migrateBun>[0], {
    migrationsFolder,
  });
}

console.log("Migrations applied successfully");
