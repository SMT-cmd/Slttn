import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { createServerSupabaseClient } from "./supabase.ts";

const originalFetch = globalThis.fetch;
const previousUrl = process.env.SUPABASE_URL;
const previousAnon = process.env.SUPABASE_ANON_KEY;

process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_ANON_KEY = "unit-test-only";

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("single() retains the id returned with PostgREST's vendor JSON content type", async () => {
  let accept = "";
  let prefer = "";
  globalThis.fetch = async (_url, init) => {
    const headers = new Headers(init.headers);
    accept = headers.get("accept") ?? "";
    prefer = headers.get("prefer") ?? "";
    return new Response(JSON.stringify({ id: "book-123", title: "Lot Size Mastery" }), {
      status: 201,
      headers: { "content-type": "application/vnd.pgrst.object+json; charset=utf-8" },
    });
  };
  const client = createServerSupabaseClient();
  const { data, error } = await client.from("books")
    .insert({ title: "Lot Size Mastery", slug: "lot-size-mastery" })
    .select("id, title")
    .single();
  assert.equal(error, null);
  assert.deepEqual(data, { id: "book-123", title: "Lot Size Mastery" });
  assert.equal(accept, "application/vnd.pgrst.object+json");
  assert.match(prefer, /return=representation/);
});

test("maybeSingle() decodes a vendor JSON object on successful lookup", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ id: "existing-draft", published: false }), {
    status: 200, headers: { "content-type": "application/vnd.pgrst.object+json" },
  });
  const { data, error } = await createServerSupabaseClient().from("books")
    .select("id, published").eq("slug", "lot-size-mastery").maybeSingle();
  assert.equal(error, null);
  assert.deepEqual(data, { id: "existing-draft", published: false });
});

test("maybeSingle() correctly treats a missing record as null", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    code: "PGRST116", message: "The result contains 0 rows",
  }), { status: 406, headers: { "content-type": "application/json" } });
  const { data, error } = await createServerSupabaseClient().from("books")
    .select("id").eq("slug", "missing").maybeSingle();
  assert.equal(data, null);
  assert.equal(error, null);
});

test("ordinary application/json errors remain visible for server-side diagnosis", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    code: "23505", message: "duplicate key value violates unique constraint",
  }), { status: 409, headers: { "content-type": "application/json" } });
  const { data, error } = await createServerSupabaseClient().from("books")
    .insert({ title: "Lot Size Mastery" }).select("id").single();
  assert.equal(data, null);
  assert.match(error.message, /duplicate key value/);
});

// The test process exits after all tests; do not restore env too early during
// concurrent test execution. These values are restored on process shutdown.
process.on("exit", () => {
  if (previousUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = previousUrl;
  if (previousAnon === undefined) delete process.env.SUPABASE_ANON_KEY;
  else process.env.SUPABASE_ANON_KEY = previousAnon;
});
