type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

type SupabaseError = { message: string };
type SupabaseResult<T> = { data: T | null; error: SupabaseError | null };

type QueryValue = string | number | boolean | null;
type MutationMode = "insert" | "update" | "delete" | "upsert";
type SingleMode = "single" | "maybeSingle" | null;

type OrderOptions = { ascending?: boolean };
type UpsertOptions = { onConflict?: string };

export type SupabaseLikeClient = {
  from(table: string): SupabaseQueryBuilder<unknown>;
};

export type SupabaseQueryBuilder<T> = PromiseLike<SupabaseResult<T>> & {
  select(columns?: string): SupabaseQueryBuilder<T>;
  insert(value: JsonValue | JsonValue[]): SupabaseQueryBuilder<T>;
  update(value: JsonValue): SupabaseQueryBuilder<T>;
  delete(): SupabaseQueryBuilder<T>;
  upsert(value: JsonValue | JsonValue[], options?: UpsertOptions): SupabaseQueryBuilder<T>;
  eq(column: string, value: QueryValue): SupabaseQueryBuilder<T>;
  gt(column: string, value: QueryValue): SupabaseQueryBuilder<T>;
  in(column: string, values: QueryValue[]): SupabaseQueryBuilder<T>;
  or(expression: string): SupabaseQueryBuilder<T>;
  order(column: string, options?: OrderOptions): SupabaseQueryBuilder<T>;
  limit(count: number): SupabaseQueryBuilder<T>;
  single(): SupabaseQueryBuilder<T>;
  maybeSingle(): SupabaseQueryBuilder<T>;
};

const globalRef = globalThis as typeof globalThis & {
  __sltBrowserSupabase__?: SupabaseLikeClient;
  __sltServerSupabase__?: Map<string, SupabaseLikeClient>;
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
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function requiredServerOrPublicEnv(
  serverName: "SUPABASE_URL" | "SUPABASE_ANON_KEY",
  publicName: "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY",
): string {
  const value = fromProcess(serverName) ?? readEnv(publicName);
  if (!value) throw new Error(`${serverName} or ${publicName} is not configured.`);
  return value;
}

function requiredServerEnv(name: "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = fromProcess(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function stringifyValue(value: QueryValue) {
  if (typeof value === "boolean") return value ? "true" : "false";
  if (value === null) return "null";
  return String(value);
}

function escapeInValue(value: QueryValue) {
  const raw = stringifyValue(value);
  if (/^[A-Za-z0-9_.-]+$/.test(raw)) return raw;
  return `"${raw.replaceAll('"', '\\"')}"`;
}

class RestQueryBuilder<T> implements SupabaseQueryBuilder<T> {
  private mutation: MutationMode | null = null;
  private payload: JsonValue | JsonValue[] | null = null;
  private upsertOptions?: UpsertOptions;
  private filters: Array<[string, string]> = [];
  private orderBy: string[] = [];
  private limitBy?: number;
  private selectedColumns?: string;
  private singleMode: SingleMode = null;

  constructor(
    private readonly baseUrl: string,
    private readonly table: string,
    private readonly apiKey: string,
    private readonly bearerToken?: string,
  ) {}

  select(columns = "*") {
    this.selectedColumns = columns;
    return this;
  }

  insert(value: JsonValue | JsonValue[]) {
    this.mutation = "insert";
    this.payload = value;
    return this;
  }

  update(value: JsonValue) {
    this.mutation = "update";
    this.payload = value;
    return this;
  }

  delete() {
    this.mutation = "delete";
    this.payload = null;
    return this;
  }

  upsert(value: JsonValue | JsonValue[], options?: UpsertOptions) {
    this.mutation = "upsert";
    this.payload = value;
    this.upsertOptions = options;
    return this;
  }

  eq(column: string, value: QueryValue) {
    this.filters.push([column, `eq.${stringifyValue(value)}`]);
    return this;
  }

  gt(column: string, value: QueryValue) {
    this.filters.push([column, `gt.${stringifyValue(value)}`]);
    return this;
  }

  in(column: string, values: QueryValue[]) {
    this.filters.push([column, `in.(${values.map((value) => escapeInValue(value)).join(",")})`]);
    return this;
  }

  or(expression: string) {
    this.filters.push(["or", `(${expression})`]);
    return this;
  }

  order(column: string, options?: OrderOptions) {
    this.orderBy.push(`${column}.${options?.ascending === false ? "desc" : "asc"}`);
    return this;
  }

  limit(count: number) {
    this.limitBy = count;
    return this;
  }

  single() {
    this.singleMode = "single";
    this.limitBy = 1;
    return this;
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    this.limitBy = 1;
    return this;
  }

  then<TResult1 = SupabaseResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private buildUrl() {
    const url = new URL(`${this.baseUrl}/rest/v1/${this.table}`);
    if (this.selectedColumns) url.searchParams.set("select", this.selectedColumns);
    if (this.upsertOptions?.onConflict) url.searchParams.set("on_conflict", this.upsertOptions.onConflict);
    if (this.orderBy.length > 0) url.searchParams.set("order", this.orderBy.join(","));
    if (this.limitBy !== undefined) url.searchParams.set("limit", String(this.limitBy));
    for (const [key, value] of this.filters) {
      url.searchParams.append(key, value);
    }
    return url;
  }

  private buildHeaders() {
    const token = this.bearerToken ?? this.apiKey;
    const headers = new Headers({
      apikey: this.apiKey,
      Authorization: `Bearer ${token}`,
    });

    if (this.mutation) headers.set("Content-Type", "application/json");
    if (this.selectedColumns || this.singleMode) {
      headers.set("Prefer", this.mutation ? "return=representation" : headers.get("Prefer") ?? "");
    } else if (this.mutation) {
      headers.set("Prefer", "return=minimal");
    }
    if (this.mutation === "upsert") {
      const prefer = headers.get("Prefer");
      headers.set(
        "Prefer",
        [prefer, "resolution=merge-duplicates"].filter(Boolean).join(","),
      );
    }
    if (this.singleMode) {
      headers.set("Accept", "application/vnd.pgrst.object+json");
    }
    if (!headers.get("Prefer")) headers.delete("Prefer");
    return headers;
  }

  private async execute(): Promise<SupabaseResult<T>> {
    const method =
      this.mutation === "insert" || this.mutation === "upsert"
        ? "POST"
        : this.mutation === "update"
          ? "PATCH"
          : this.mutation === "delete"
            ? "DELETE"
            : "GET";

    const response = await fetch(this.buildUrl(), {
      method,
      headers: this.buildHeaders(),
      body: this.mutation && this.mutation !== "delete" ? JSON.stringify(this.payload) : undefined,
    });

    const text = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const payload = text && contentType.includes("application/json") ? (JSON.parse(text) as T) : null;

    if (this.singleMode === "maybeSingle" && response.status === 406) {
      return { data: null, error: null };
    }

    if (!response.ok) {
      const errorMessage =
        typeof payload === "object" && payload !== null && "message" in payload
          ? String((payload as { message?: string }).message)
          : text || `${response.status} ${response.statusText}`;
      return { data: null, error: { message: errorMessage } };
    }

    return { data: payload, error: null };
  }
}

class RestSupabaseClient implements SupabaseLikeClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly bearerToken?: string,
  ) {}

  from(table: string) {
    return new RestQueryBuilder(this.baseUrl, table, this.apiKey, this.bearerToken);
  }
}

function createRestClient(apiKey: string, bearerToken?: string): SupabaseLikeClient {
  return new RestSupabaseClient(normalizeBaseUrl(requiredPublicEnv("VITE_SUPABASE_URL")), apiKey, bearerToken);
}

function createServerRestClient(apiKey: string, bearerToken?: string): SupabaseLikeClient {
  return new RestSupabaseClient(
    normalizeBaseUrl(requiredServerOrPublicEnv("SUPABASE_URL", "VITE_SUPABASE_URL")),
    apiKey,
    bearerToken,
  );
}

export function createBrowserSupabaseClient(): SupabaseLikeClient {
  globalRef.__sltBrowserSupabase__ ??= createRestClient(requiredPublicEnv("VITE_SUPABASE_ANON_KEY"));
  return globalRef.__sltBrowserSupabase__;
}

export function createServerSupabaseClient(accessToken?: string): SupabaseLikeClient {
  const key = requiredServerOrPublicEnv("SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
  if (!accessToken) {
    globalRef.__sltServerSupabase__ ??= new Map<string, SupabaseLikeClient>();
    const cacheKey = "anon";
    if (!globalRef.__sltServerSupabase__.has(cacheKey)) {
      globalRef.__sltServerSupabase__.set(cacheKey, createServerRestClient(key));
    }
    return globalRef.__sltServerSupabase__.get(cacheKey)!;
  }
  return createServerRestClient(key, accessToken);
}

export function getSupabaseAdmin(): SupabaseLikeClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() is server-only.");
  }
  globalRef.__sltAdminSupabase__ ??= createServerRestClient(requiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"));
  return globalRef.__sltAdminSupabase__;
}

export function getSupabaseDatabaseUrl(): string | undefined {
  return fromProcess("DATABASE_URL");
}
