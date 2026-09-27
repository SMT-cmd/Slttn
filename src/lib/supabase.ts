import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseLikeClient = SupabaseClient;

const browserRef = globalThis as typeof globalThis & {
  __sltBrowserSupabase__?: SupabaseLikeClient;
  __sltAdminSupabase__?: SupabaseLikeClient;
};

function fromImportMeta(name: string): string | undefined {
  const value = import.meta.env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function fromProcess(name: string): string | undefined {
  const value = typeof process !== "undefined" ? process.env[name]?.trim() : undefined;
  return value ? value : undefined;
}

function readEnv(name: string): string | undefined {
  return fromImportMeta(name) ?? fromProcess(name);
}

function requiredPublicEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY"): string {
  const value = readEnv(name);
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function requiredServerEnv(name: "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = fromProcess(name);
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function buildBrowserClient(): SupabaseLikeClient {
  return createClient(requiredPublicEnv("VITE_SUPABASE_URL"), requiredPublicEnv("VITE_SUPABASE_ANON_KEY"), {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export function createBrowserSupabaseClient(): SupabaseLikeClient {
  browserRef.__sltBrowserSupabase__ ??= buildBrowserClient();
  return browserRef.__sltBrowserSupabase__;
}

export function createServerSupabaseClient(accessToken?: string): SupabaseLikeClient {
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
  return createClient(requiredPublicEnv("VITE_SUPABASE_URL"), requiredPublicEnv("VITE_SUPABASE_ANON_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: headers ? { headers } : undefined,
  });
}

export function getSupabaseAdmin(): SupabaseLikeClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() is server-only.");
  }
  browserRef.__sltAdminSupabase__ ??= createClient(
    requiredPublicEnv("VITE_SUPABASE_URL"),
    requiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );
  return browserRef.__sltAdminSupabase__;
}

export function getSupabaseDatabaseUrl(): string | undefined {
  return fromProcess("DATABASE_URL");
}
