#!/usr/bin/env node
/**
 * Deploy-time database migrator (node-postgres, `pg`).
 *
 * Runs during `npm run build` — on every Vercel deploy — applying pending files
 * in ../migrations to DATABASE_URL. Each file is applied in one transaction and
 * recorded in a `_migrations` table, so it runs once and is safe to re-run.
 *
 * The read is non-recursive, so the opt-in auth schema under migrations/auth/
 * is not applied to an app that never asked for sign-in.
 *
 * No DATABASE_URL (local / preview builds) -> skip; the PGLite fallback applies
 * the same files at startup instead (see src/lib/db.ts).
 */
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
import { pendingMigrations } from "./migration-plan.mjs";
import { createPostgresPoolConfig } from "../src/lib/postgres-config.js";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

const TRANSIENT_DB_ERROR_CODES = new Set(["ENETUNREACH", "ECONNREFUSED", "ETIMEDOUT"]);
const TRANSIENT_DB_ERROR_PATTERNS = [
  /\bconnect(?:ion)?\b.*\btime(?:d)? out\b/i,
  /\btime(?:d)? out\b.*\bconnect(?:ion)?\b/i,
  /\bconnection timeout\b/i,
  /\btimeout expired\b/i,
];

export function isTransientBuildConnectivityError(err) {
  for (let current = err; current; current = current.cause) {
    const code = typeof current?.code === "string" ? current.code.toUpperCase() : "";
    if (TRANSIENT_DB_ERROR_CODES.has(code)) return true;

    const message = typeof current?.message === "string" ? current.message : "";
    if (
      message &&
      !/\bstatement timeout\b/i.test(message) &&
      TRANSIENT_DB_ERROR_PATTERNS.some((pattern) => pattern.test(message))
    ) {
      return true;
    }
  }
  return false;
}

function logErrorDetails(err, error = console.error) {
  error("[migrate] failed:", err?.message || err);
  // pg errors carry the context needed to debug a bad SQL file.
  for (const key of ["code", "detail", "hint", "position", "where"]) {
    if (err?.[key] != null) error(`[migrate]   ${key}: ${err[key]}`);
  }
}

async function createDefaultPool(config) {
  const { default: pg } = await import("pg");
  return new pg.Pool(config);
}

export async function runMigrations({
  databaseUrl = process.env.DATABASE_URL,
  migrationsDirectory = migrationsDir,
  createPool = createDefaultPool,
  listDir = readdir,
  readMigrationFile = readFile,
  log = console.log,
} = {}) {
  if (!databaseUrl) {
    log("[migrate] DATABASE_URL not set — skipping.");
    return 0;
  }

  let entries;
  try {
    entries = await listDir(migrationsDirectory);
  } catch {
    log("[migrate] no migrations/ directory — nothing to do.");
    return 0;
  }
  // An app with no schema of its own must not pay for a database connection.
  if (pendingMigrations(entries, []).length === 0) {
    log("[migrate] no migrations — nothing to do.");
    return 0;
  }

  const pool = await createPool(createPostgresPoolConfig(databaseUrl, { max: 1 }));
  let client;
  try {
    client = await pool.connect();
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = (await client.query("SELECT name FROM _migrations")).rows.map(
      (r) => r.name,
    );

    let count = 0;
    for (const { name } of pendingMigrations(entries, applied)) {
      const text = await readMigrationFile(join(migrationsDirectory, name), "utf8");
      try {
        await client.query("BEGIN");
        // pg's simple-query protocol runs a whole multi-statement file at once.
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
      } catch (err) {
        console.error(`[migrate] error applying ${name}`);
        try {
          await client.query("ROLLBACK");
        } catch {
          // ROLLBACK fails when the connection died — keep the original error.
        }
        throw err;
      }
      log(`[migrate] applied ${name}`);
      count += 1;
    }
    log(count ? `[migrate] done — ${count} migration(s) applied.` : "[migrate] up to date.");
    return 0;
  } finally {
    client?.release();
    await pool.end();
  }
}

export async function main(options = {}) {
  const error = options.error ?? console.error;
  try {
    return await runMigrations(options);
  } catch (err) {
    if (isTransientBuildConnectivityError(err)) {
      error("[migrate] transient DB connectivity problem during build — skipping migrations so deploy can continue.");
      logErrorDetails(err, error);
      return 0;
    }

    logErrorDetails(err, error);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === fileURLToPath(pathToFileURL(resolve(process.argv[1])))) {
  process.exit(await main());
}
