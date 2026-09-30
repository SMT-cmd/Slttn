import assert from "node:assert/strict";
import test from "node:test";
import { isAllowlistedAdminEmail, parseAdminEmails, runAdminAccessCheck } from "./access.ts";

test("parses ADMIN_EMAILS as a normalized comma-separated allowlist", () => {
  const emails = parseAdminEmails(" Admin@Example.com,owner@example.com ,, SECOND@example.com ");

  assert.deepEqual([...emails], [
    "admin@example.com",
    "owner@example.com",
    "second@example.com",
  ]);
});

test("matches allowlisted admin emails case-insensitively", () => {
  assert.equal(
    isAllowlistedAdminEmail("Owner@Example.com", "admin@example.com, owner@example.com"),
    true,
  );
  assert.equal(isAllowlistedAdminEmail("member@example.com", "admin@example.com, owner@example.com"), false);
  assert.equal(isAllowlistedAdminEmail(null, "admin@example.com"), false);
});

test("returns the admin access result when the check resolves in time", async () => {
  const result = await runAdminAccessCheck(
    async () => ({ allowed: true, message: null }),
    50,
  );

  assert.deepEqual(result, { allowed: true, message: null });
});

test("fails fast when the admin access check never settles", async () => {
  await assert.rejects(
    () => runAdminAccessCheck(() => new Promise(() => undefined), 10),
    /Admin access check timed out/,
  );
});
