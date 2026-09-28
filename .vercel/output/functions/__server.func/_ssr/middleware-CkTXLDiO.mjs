import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-CkTXLDiO.js
var DERIV_API_BASE = "https://api.derivws.com";
var DERIV_PROVIDER_ID = "grok-deriv";
function readEnv$1(name) {
	const value = typeof process !== "undefined" ? process.env[name]?.trim() : void 0;
	return value ? value : void 0;
}
function getDerivPartnerToken() {
	return readEnv$1("DERIV_PARTNER_TOKEN") ?? readEnv$1("DERIV_API_TOKEN");
}
function getDerivAppId() {
	return readEnv$1("DERIV_APP_ID");
}
function canCheckDerivTags() {
	return Boolean(getDerivPartnerToken() && getDerivAppId());
}
async function checkDerivClientTags(clientIds) {
	const token = getDerivPartnerToken();
	const appId = getDerivAppId();
	if (!token || !appId || clientIds.length === 0) return /* @__PURE__ */ new Map();
	const uniqueClientIds = [...new Set(clientIds.map((value) => value.trim()).filter(Boolean))].slice(0, 100);
	if (uniqueClientIds.length === 0) return /* @__PURE__ */ new Map();
	const response = await fetch(`${DERIV_API_BASE}/partners/client-tags/check`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			"Deriv-App-ID": appId
		},
		body: JSON.stringify({ client_ids: uniqueClientIds })
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || "Deriv tag check failed.");
	}
	const payload = await response.json();
	const rows = payload.data ?? payload.results ?? [];
	const tagged = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const clientId = row.client_id ?? row.clientId;
		if (!clientId) continue;
		tagged.set(clientId, Boolean(row.is_tagged ?? row.isTagged));
	}
	return tagged;
}
var globalRef = globalThis;
function fromImportMeta(name) {
	const value = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	}[name];
	return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function fromProcess(name) {
	const value = typeof process !== "undefined" ? process.env[name]?.trim() : void 0;
	return value ? value : void 0;
}
function readEnv(name) {
	return fromImportMeta(name) ?? fromProcess(name);
}
function requiredServerOrPublicEnv(serverName, publicName) {
	const value = fromProcess(serverName) ?? readEnv(publicName);
	if (!value) throw new Error(`${serverName} or ${publicName} is not configured.`);
	return value;
}
function requiredServerEnv(name) {
	const value = fromProcess(name);
	if (!value) throw new Error(`${name} is not configured.`);
	return value;
}
function normalizeBaseUrl(url) {
	return url.replace(/\/+$/, "");
}
function stringifyValue(value) {
	if (typeof value === "boolean") return value ? "true" : "false";
	if (value === null) return "null";
	return String(value);
}
function escapeInValue(value) {
	const raw = stringifyValue(value);
	if (/^[A-Za-z0-9_.-]+$/.test(raw)) return raw;
	return `"${raw.replaceAll("\"", "\\\"")}"`;
}
var RestQueryBuilder = class {
	baseUrl;
	table;
	apiKey;
	bearerToken;
	mutation = null;
	payload = null;
	upsertOptions;
	filters = [];
	orderBy = [];
	limitBy;
	selectedColumns;
	singleMode = null;
	constructor(baseUrl, table, apiKey, bearerToken) {
		this.baseUrl = baseUrl;
		this.table = table;
		this.apiKey = apiKey;
		this.bearerToken = bearerToken;
	}
	select(columns = "*") {
		this.selectedColumns = columns;
		return this;
	}
	insert(value) {
		this.mutation = "insert";
		this.payload = value;
		return this;
	}
	update(value) {
		this.mutation = "update";
		this.payload = value;
		return this;
	}
	delete() {
		this.mutation = "delete";
		this.payload = null;
		return this;
	}
	upsert(value, options) {
		this.mutation = "upsert";
		this.payload = value;
		this.upsertOptions = options;
		return this;
	}
	eq(column, value) {
		this.filters.push([column, `eq.${stringifyValue(value)}`]);
		return this;
	}
	gt(column, value) {
		this.filters.push([column, `gt.${stringifyValue(value)}`]);
		return this;
	}
	in(column, values) {
		this.filters.push([column, `in.(${values.map((value) => escapeInValue(value)).join(",")})`]);
		return this;
	}
	or(expression) {
		this.filters.push(["or", `(${expression})`]);
		return this;
	}
	order(column, options) {
		this.orderBy.push(`${column}.${options?.ascending === false ? "desc" : "asc"}`);
		return this;
	}
	limit(count) {
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
	then(onfulfilled, onrejected) {
		return this.execute().then(onfulfilled, onrejected);
	}
	buildUrl() {
		const url = new URL(`${this.baseUrl}/rest/v1/${this.table}`);
		if (this.selectedColumns) url.searchParams.set("select", this.selectedColumns);
		if (this.upsertOptions?.onConflict) url.searchParams.set("on_conflict", this.upsertOptions.onConflict);
		if (this.orderBy.length > 0) url.searchParams.set("order", this.orderBy.join(","));
		if (this.limitBy !== void 0) url.searchParams.set("limit", String(this.limitBy));
		for (const [key, value] of this.filters) url.searchParams.append(key, value);
		return url;
	}
	buildHeaders() {
		const token = this.bearerToken ?? this.apiKey;
		const headers = new Headers({
			apikey: this.apiKey,
			Authorization: `Bearer ${token}`
		});
		if (this.mutation) headers.set("Content-Type", "application/json");
		if (this.selectedColumns || this.singleMode) headers.set("Prefer", this.mutation ? "return=representation" : headers.get("Prefer") ?? "");
		else if (this.mutation) headers.set("Prefer", "return=minimal");
		if (this.mutation === "upsert") {
			const prefer = headers.get("Prefer");
			headers.set("Prefer", [prefer, "resolution=merge-duplicates"].filter(Boolean).join(","));
		}
		if (this.singleMode) headers.set("Accept", "application/vnd.pgrst.object+json");
		if (!headers.get("Prefer")) headers.delete("Prefer");
		return headers;
	}
	async execute() {
		const method = this.mutation === "insert" || this.mutation === "upsert" ? "POST" : this.mutation === "update" ? "PATCH" : this.mutation === "delete" ? "DELETE" : "GET";
		const response = await fetch(this.buildUrl(), {
			method,
			headers: this.buildHeaders(),
			body: this.mutation && this.mutation !== "delete" ? JSON.stringify(this.payload) : void 0
		});
		const text = await response.text();
		const contentType = response.headers.get("content-type") ?? "";
		const payload = text && contentType.includes("application/json") ? JSON.parse(text) : null;
		if (this.singleMode === "maybeSingle" && response.status === 406) return {
			data: null,
			error: null
		};
		if (!response.ok) return {
			data: null,
			error: { message: typeof payload === "object" && payload !== null && "message" in payload ? String(payload.message) : text || `${response.status} ${response.statusText}` }
		};
		return {
			data: payload,
			error: null
		};
	}
};
var RestSupabaseClient = class {
	baseUrl;
	apiKey;
	bearerToken;
	constructor(baseUrl, apiKey, bearerToken) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.bearerToken = bearerToken;
	}
	from(table) {
		return new RestQueryBuilder(this.baseUrl, table, this.apiKey, this.bearerToken);
	}
};
function createServerRestClient(apiKey, bearerToken) {
	return new RestSupabaseClient(normalizeBaseUrl(requiredServerOrPublicEnv("SUPABASE_URL", "VITE_SUPABASE_URL")), apiKey, bearerToken);
}
function getSupabaseAdmin() {
	if (typeof window !== "undefined") throw new Error("getSupabaseAdmin() is server-only.");
	globalRef.__sltAdminSupabase__ ??= createServerRestClient(requiredServerEnv("SUPABASE_SERVICE_ROLE_KEY"));
	return globalRef.__sltAdminSupabase__;
}
function getDb() {
	return getSupabaseAdmin();
}
function ensureDbReady() {
	return Promise.resolve();
}
async function getPglite() {
	throw new Error("PGlite has been removed. Configure Supabase and DATABASE_URL instead.");
}
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-CGHzwkia.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-CyhQ3r-I.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
export { ensureDbReady as a, getSupabaseAdmin as c, checkDerivClientTags as i, authMiddleware as n, getDb as o, canCheckDerivTags as r, getPglite as s, DERIV_PROVIDER_ID as t };
