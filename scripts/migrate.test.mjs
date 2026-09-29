import assert from "node:assert/strict";
import { test } from "node:test";
import { isTransientBuildConnectivityError, main, runMigrations } from "./migrate.mjs";

function createFakePool({
  appliedRows = [],
  failOnConnect,
  failOnQuery,
} = {}) {
  const queries = [];
  let released = false;
  let ended = false;

  const client = {
    async query(sql, params) {
      queries.push({ sql, params });
      if (failOnQuery) {
        throw failOnQuery;
      }
      if (sql === "SELECT name FROM _migrations") {
        return { rows: appliedRows.map((name) => ({ name })) };
      }
      return { rows: [] };
    },
    release() {
      released = true;
    },
  };

  const pool = {
    async connect() {
      if (failOnConnect) throw failOnConnect;
      return client;
    },
    async end() {
      ended = true;
    },
  };

  return {
    pool,
    queries,
    get released() {
      return released;
    },
    get ended() {
      return ended;
    },
  };
}

test("detects transient build-time connectivity failures without swallowing SQL errors", () => {
  assert.equal(
    isTransientBuildConnectivityError(
      Object.assign(new Error("connect ENETUNREACH 2a05:d014::1:5432"), { code: "ENETUNREACH" }),
    ),
    true,
  );
  assert.equal(
    isTransientBuildConnectivityError(
      Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), { code: "ECONNREFUSED" }),
    ),
    true,
  );
  assert.equal(
    isTransientBuildConnectivityError(new Error("Connection terminated due to connection timeout")),
    true,
  );
  assert.equal(
    isTransientBuildConnectivityError(
      Object.assign(new Error('syntax error at or near "CREAT"'), { code: "42601" }),
    ),
    false,
  );
  assert.equal(
    isTransientBuildConnectivityError(new Error("canceling statement due to statement timeout")),
    false,
  );
});

test("skips cleanly when DATABASE_URL is missing", async () => {
  const logs = [];
  const exitCode = await runMigrations({
    databaseUrl: undefined,
    log: (line) => logs.push(line),
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(logs, ["[migrate] DATABASE_URL not set — skipping."]);
});

test("runs pending migrations with IPv4-friendly pool config when DATABASE_URL is reachable", async () => {
  const logs = [];
  let capturedConfig;
  const fakePool = createFakePool();

  const exitCode = await runMigrations({
    databaseUrl: "postgres://db.example/app",
    listDir: async () => ["0001_init.sql"],
    readMigrationFile: async () => "CREATE TABLE demo(id INT);",
    createPool: (config) => {
      capturedConfig = config;
      return fakePool.pool;
    },
    log: (line) => logs.push(line),
  });

  assert.equal(exitCode, 0);
  assert.deepEqual(capturedConfig, {
    connectionString: "postgres://db.example/app",
    max: 1,
    family: 4,
  });
  assert.equal(fakePool.released, true);
  assert.equal(fakePool.ended, true);
  assert.deepEqual(
    fakePool.queries.map((entry) => entry.sql),
    [
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
      "SELECT name FROM _migrations",
      "BEGIN",
      "CREATE TABLE demo(id INT);",
      "INSERT INTO _migrations (name) VALUES ($1)",
      "COMMIT",
    ],
  );
  assert.equal(logs.at(-2), "[migrate] applied 0001_init.sql");
  assert.equal(logs.at(-1), "[migrate] done — 1 migration(s) applied.");
});

test("returns success for transient DB connectivity failures during build", async () => {
  const errors = [];
  const exitCode = await main({
    databaseUrl: "postgres://db.example/app",
    listDir: async () => ["0001_init.sql"],
    createPool: () =>
      createFakePool({
        failOnConnect: Object.assign(
          new Error("connect ENETUNREACH 2a05:d014::abcd:5432"),
          { code: "ENETUNREACH" },
        ),
      }).pool,
    error: (...parts) => errors.push(parts.join(" ")),
  });

  assert.equal(exitCode, 0);
  assert.match(errors[0], /transient DB connectivity problem during build/);
  assert.match(errors[1], /connect ENETUNREACH/);
});

test("keeps real migration errors fatal", async () => {
  const errors = [];
  const exitCode = await main({
    databaseUrl: "postgres://db.example/app",
    listDir: async () => ["0001_bad.sql"],
    readMigrationFile: async () => "CREAT TABLE broken(id INT);",
    createPool: () =>
      createFakePool({
        failOnQuery: Object.assign(new Error('syntax error at or near "CREAT"'), {
          code: "42601",
          position: "1",
        }),
      }).pool,
    error: (...parts) => errors.push(parts.join(" ")),
  });

  assert.equal(exitCode, 1);
  assert.match(errors[0], /syntax error at or near "CREAT"/);
  assert.match(errors[1], /\[migrate\]\s+code: 42601/);
  assert.match(errors[2], /\[migrate\]\s+position: 1/);
});
