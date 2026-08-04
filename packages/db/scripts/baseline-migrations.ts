import { sql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { db } from "../src";

// Marks every migration currently in drizzle/ as already applied, without running their SQL.
// Needed the one time a database's schema was created by `drizzle-kit push` (no migration
// history) and is now being adopted into the generate+migrate workflow - running `db:migrate`
// against such a database would otherwise try to CREATE TABLE things that already exist.
async function main() {
  const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" });
  const last = migrations.at(-1);

  if (!last) {
    console.log("No migrations found in drizzle/ - nothing to baseline.");
    return;
  }

  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);

  const existing = await db.execute(
    sql`select id from "drizzle"."__drizzle_migrations" order by created_at desc limit 1`
  );

  if (existing.length > 0) {
    console.log("Migrations table already has an entry - this database is already baselined.");
    return;
  }

  await db.execute(
    sql`insert into "drizzle"."__drizzle_migrations" ("hash", "created_at") values (${last.hash}, ${last.folderMillis})`
  );

  console.log(`Baselined at the latest migration (hash ${last.hash}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
