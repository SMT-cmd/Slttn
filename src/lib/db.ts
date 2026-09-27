import { getSupabaseAdmin, getSupabaseDatabaseUrl } from "./supabase";

export type DbSource = "supabase";

export const dbSource: DbSource = "supabase";

export function getDb() {
  return getSupabaseAdmin();
}

export function ensureDbReady(): Promise<void> {
  return Promise.resolve();
}

export function getDatabaseUrl(): string | undefined {
  return getSupabaseDatabaseUrl();
}

export async function getPglite(): Promise<never> {
  throw new Error("PGlite has been removed. Configure Supabase and DATABASE_URL instead.");
}

export async function getSql(): Promise<never> {
  throw new Error("Raw SQL access has been removed. Use Supabase helpers from @/lib/supabase instead.");
}
