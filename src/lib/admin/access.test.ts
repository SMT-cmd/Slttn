import assert from "node:assert/strict";
import test from "node:test";
import { runAdminAccessCheck } from "./access";

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
