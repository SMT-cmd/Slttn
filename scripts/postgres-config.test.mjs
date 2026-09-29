import assert from "node:assert/strict";
import { test } from "node:test";
import { createPostgresPoolConfig } from "../src/lib/postgres-config.js";

test("Postgres pool config forces IPv4 for managed hosts that resolve IPv6 first", () => {
  assert.deepEqual(createPostgresPoolConfig("postgres://db.example/app"), {
    connectionString: "postgres://db.example/app",
    family: 4,
  });
});

test("Postgres pool config preserves caller overrides while keeping IPv4 forced", () => {
  assert.deepEqual(createPostgresPoolConfig("postgres://db.example/app", { max: 1 }), {
    connectionString: "postgres://db.example/app",
    max: 1,
    family: 4,
  });
});
