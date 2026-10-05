import { readdir, readFile } from "fs/promises";
import { resolve, join } from "path";
import { getPool, closePool } from "./client.js";

const MIGRATIONS_DIR = resolve(new URL(".", import.meta.url).pathname, "../migrations");

export async function runMigrations(): Promise<void> {
  const pool = getPool();

  // Create tracking table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Get applied migrations
  const applied = await pool.query<{ filename: string }>(
    `SELECT filename FROM schema_migrations ORDER BY filename`,
  );
  const appliedSet = new Set(applied.rows.map((r) => r.filename));

  // Read all migration files sorted
  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let count = 0;
  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf-8");
    console.log(`Applying migration: ${file}`);

    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query(`INSERT INTO schema_migrations (filename) VALUES ($1)`, [file]);
      await pool.query("COMMIT");
      count++;
    } catch (err) {
      await pool.query("ROLLBACK");
      throw new Error(`Migration ${file} failed: ${err}`);
    }
  }

  console.log(`Applied ${count} migration(s). Total: ${files.length}.`);
}

// Run directly: node dist/migrate.js
if (process.argv[1]?.endsWith("migrate.js")) {
  runMigrations()
    .then(() => closePool())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
