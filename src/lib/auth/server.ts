/**
 * Self-hosted Better Auth for THIS app (server-only).
 *
 * Pre-wired for live preview + deploy — do not rewrite this file. To enable
 * local email/password, flip the flag in `./email-password` only (see auth skill).
 *
 * The app runs its own Better Auth at `/api/auth/*`, so the session cookie stays
 * on this app's own origin. Email/password is handled locally. Google uses
 * Better Auth's native social provider, and Deriv uses a direct PKCE OAuth flow
 * via the `genericOAuth` plugin.
 *
 * Tri-mode:
 *   - Deployed: the deployer injects `BETTER_AUTH_URL` + `DATABASE_URL`, so
 *     auth is persisted in Postgres.
 *   - Sandbox live preview: derives the preview's `https://*.grok-sandbox.com`
 *     origin from the request. Sessions and identities persist in the embedded
 *     PGLite DB (same DB as app data); the process restart wipes both. Live-
 *     preview iframe clients use a bearer token (partitioned cookies) — see
 *     `client.ts`.
 *   - Off (`VITE_AUTH_ENABLED=false`, the shipped default): no providers;
 *     `requireUserId` resolves a dev user with no database configured, and
 *     throws fail-closed once `DATABASE_URL` is set (see `verify.server.ts`).
 *
 * NEVER import this from client code — it pulls in `pg` + the preview secret +
 * server-only Better Auth internals. The client uses `@/lib/auth/client`;
 * components read the user via `@/lib/auth/use-current-user`; server functions get
 * a verified id via `@/lib/auth/middleware`.
 */
import { betterAuth } from "better-auth";
import { bearer, genericOAuth } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { createPostgresPoolConfig } from "../postgres-config.js";
import { DERIV_PROVIDER_ID } from "../deriv";
import { emailAndPasswordEnabled } from "./email-password";
import { GATE_PROVIDER_ID, gateIdentitySessions } from "./gate-session.server";
import { AUTH_PROVIDERS } from "./providers";
import { pgliteDialect } from "./pglite-dialect";
import { PREVIEW_ALLOWED_HOSTS } from "./preview";

// Kick (and share) PGLite bootstrap as soon as the auth server module loads.
void ensureDbReady();

/**
 * Preview secret must outlive module reloads: PGLite (and its session rows) is
 * stored on `globalThis`, so an HMR re-eval of this file must NOT mint a new
 * signing secret or every existing session becomes invalid mid-dev. Process
 * restart clears both the secret and PGLite together.
 */
const globalAuthRef = globalThis as typeof globalThis & {
  __appAuthPreviewSecret__?: string;
};
function previewAuthSecret(): string {
  globalAuthRef.__appAuthPreviewSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__appAuthPreviewSecret__;
}

/** Read an env var, treating empty/whitespace as unset. */
const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
};

// Explicit off-switch. The deployer sets `VITE_AUTH_ENABLED=true` when it
// provisions auth; set it to "false" to force auth off everywhere (dev user).
const authDisabled = env("VITE_AUTH_ENABLED") === "false";
const googleClientId = env("GOOGLE_CLIENT_ID");
const googleClientSecret = env("GOOGLE_CLIENT_SECRET");
const derivAppId = env("DERIV_APP_ID");

/** True when real auth is enforced. */
export const authConfigured = !authDisabled;

// This app's own Better Auth origin. When deployed the deployer injects the
// public URL. In the sandbox live preview there's no fixed URL (each preview gets
// a dynamic `*.grok-sandbox.com` host), so we hand Better Auth a dynamic baseURL:
// it derives the origin per-request from the (proxied) host, validated against the
// preview allowlist, which makes the OAuth redirect use the concrete preview URL.
const explicitBaseURL = env("BETTER_AUTH_URL");
// Explicit `string[]` (not a readonly tuple) — Better Auth's DynamicBaseURLConfig
// requires a mutable `allowedHosts: string[]`.
const previewAllowedHosts: string[] = [...PREVIEW_ALLOWED_HOSTS];
// Local `npm run dev` (port 8080 contract). Browsers may send Origin as any of
// these for the same server — trusting only `localhost` rejects `127.0.0.1` and
// breaks email/password with "Invalid origin".
const LOCAL_DEV_ORIGINS: string[] = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? {
  // Include loopback hosts so dynamic baseURL resolves for local email/password
  // (not only the preview wildcard).
  allowedHosts: [...previewAllowedHosts, "localhost", "127.0.0.1", "[::1]"],
  // `auto` → trust both http:// and https:// expansions of allowedHosts
  // (preview is https; local dev is http).
  protocol: "auto" as const,
  fallback: "http://localhost:8080",
};

// Origins Better Auth accepts on credentialed POSTs (sign-up/sign-in, etc.).
// Missing entries here surface as FORBIDDEN "Invalid origin".
const trustedOrigins: string[] = explicitBaseURL
  ? [explicitBaseURL, ...LOCAL_DEV_ORIGINS]
  : [
      // Host wildcards (matched against Origin's host)
      ...previewAllowedHosts,
      // Full-origin wildcards (matched against Origin)
      ...previewAllowedHosts.flatMap((host) => [`https://${host}`, `http://${host}`]),
      ...LOCAL_DEV_ORIGINS,
    ];

const databaseUrl = env("DATABASE_URL");

// Real Postgres when `DATABASE_URL` is set (deployed apps), else the app's
// embedded PGLite (preview) via a Kysely dialect — so Better Auth persists to the
// SAME DB as app data, including email/password users. Both use the Better Auth
// schema from `migrations/auth/0001_auth.sql`, copied into `migrations/` when
// the app turns sign-in on.
const database = databaseUrl
  ? new Pool(createPostgresPoolConfig(databaseUrl))
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

/** Session token cookie name — also read by the live-preview popup completion page. */
export const SESSION_TOKEN_COOKIE = "__Host-app-auth.session_token";

const DERIV_AUTHORIZATION_URL = "https://auth.deriv.com/oauth2/auth";
const DERIV_TOKEN_URL = "https://auth.deriv.com/oauth2/token";
const DERIV_API_BASE = "https://api.derivws.com";
const DERIV_SCOPES = ["trade", "account_manage"];

type DerivIdentity = {
  accountId: string;
  name: string | null;
};

function normalizeDerivAccountId(value: string): string {
  return value.trim().toUpperCase();
}

function firstString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readObjectString(
  payload: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = firstString(payload[key]);
    if (value) return value;
  }
  return null;
}

function extractDerivAccountId(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractDerivAccountId(entry);
      if (found) return found;
    }
    return null;
  }

  const record = payload as Record<string, unknown>;
  const direct = readObjectString(record, [
    "loginid",
    "loginId",
    "client_id",
    "clientId",
    "account_id",
    "accountId",
    "cr",
    "id",
  ]);
  if (direct) return normalizeDerivAccountId(direct);

  const loginids = record.loginids;
  if (loginids && typeof loginids === "object" && !Array.isArray(loginids)) {
    const key = Object.keys(loginids as Record<string, unknown>).find((candidate) =>
      Boolean(candidate.trim()),
    );
    if (key) return normalizeDerivAccountId(key);
  }

  for (const value of Object.values(record)) {
    const found = extractDerivAccountId(value);
    if (found) return found;
  }
  return null;
}

function extractDerivName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = extractDerivName(entry);
      if (found) return found;
    }
    return null;
  }

  const record = payload as Record<string, unknown>;
  const direct = readObjectString(record, ["nickname", "name", "full_name", "fullName"]);
  if (direct) return direct;

  for (const value of Object.values(record)) {
    const found = extractDerivName(value);
    if (found) return found;
  }
  return null;
}

async function fetchJson(
  url: string,
  init: RequestInit,
): Promise<unknown | null> {
  const response = await fetch(url, init);
  if (!response.ok) {
    if (response.status === 404 || response.status === 409) return null;
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `Request failed: ${response.status}`);
  }
  return response.json().catch(() => null);
}

async function fetchDerivIdentity(accessToken: string): Promise<DerivIdentity> {
  if (!derivAppId) throw new Error("DERIV_APP_ID is not configured");

  const headers = {
    accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Deriv-App-ID": derivAppId,
  };
  const [legacyAccounts, optionAccounts, nickname] = await Promise.all([
    fetchJson(`${DERIV_API_BASE}/trading/v1/options/legacy/accounts`, {
      headers,
    }),
    fetchJson(`${DERIV_API_BASE}/trading/v1/options/accounts`, {
      headers,
    }),
    fetchJson(`${DERIV_API_BASE}/account/v1/nickname`, {
      headers,
    }).catch(() => null),
  ]);

  const accountId =
    extractDerivAccountId(legacyAccounts) ?? extractDerivAccountId(optionAccounts);
  if (!accountId) {
    throw new Error("Could not resolve a Deriv account identifier from OAuth");
  }

  return {
    accountId,
    name: extractDerivName(nickname) ?? `Deriv ${accountId}`,
  };
}

const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

// Built separately so the `betterAuth({...})` call stays easy to edit without
// breaking brackets.
const derivOAuthPlugin =
  derivAppId && !authDisabled
    ? genericOAuth({
        config: [
          {
            providerId: DERIV_PROVIDER_ID,
            clientId: derivAppId,
            // Deriv's OAuth app uses App ID + PKCE as a public client.
            clientSecret: "",
            authorizationUrl: DERIV_AUTHORIZATION_URL,
            tokenUrl: DERIV_TOKEN_URL,
            scopes: DERIV_SCOPES,
            pkce: true,
            getUserInfo: async (tokens) => {
              const identity = await fetchDerivIdentity(tokens.accessToken);
              const email = `${identity.accountId.toLowerCase()}@deriv.local`;
              return {
                id: identity.accountId,
                email,
                name: identity.name,
              };
            },
          },
        ],
      })
    : null;

export const auth = betterAuth({
  baseURL,
  // Deployed apps inject BETTER_AUTH_SECRET. Preview: process-stable secret on
  // globalThis so HMR doesn't invalidate PGLite-backed sessions (see above).
  secret: env("BETTER_AUTH_SECRET") ?? previewAuthSecret(),
  database,

  // CSRF / origin check for credentialed auth POSTs (email sign-up/sign-in, …).
  // See `trustedOrigins` construction above — must cover live preview hosts AND
  // local loopback variants, or clients get "Invalid origin".
  trustedOrigins,

  // Encrypt broker-issued OAuth tokens at rest, and treat the broker's upstreams
  // as trusted first-party identities. The broker owns identity and X emails are
  // synthetic/unverified, so WITHOUT this a login can fail with
  // `account_not_linked` (Better Auth refuses to attach an untrusted, unverified
  // identity to an existing user). Google and X carry DISTINCT emails, so this
  // never merges them into one user — they stay separate identities.
  account: {
    encryptOAuthTokens: true,
    accountLinking: {
      enabled: true,
      trustedProviders: [
        ...AUTH_PROVIDERS.map((p) => p.providerId),
        GATE_PROVIDER_ID,
      ],
      // X's synthetic email is never "verified", so don't gate linking on the
      // local user's email-verified state.
      requireLocalEmailVerified: false,
    },
  },

  // Cache the session in the short-lived signed `session_data` cookie so reads
  // (incl. the client's `/get-session`) skip the DB — this shrinks the "loading"
  // window and reduces auth flicker. See the `auth` skill for the full
  // flicker-prevention guidance (gate on `isPending`; SSR the session).
  session: { cookieCache: { enabled: true, maxAge: 300 } },

  // Local email/password — toggled only via `./email-password` (not a plugin).
  ...(emailAndPasswordEnabled ? { emailAndPassword: { enabled: true } } : {}),

  // `__Host-` prefixed cookies: the browser REFUSES any same-named cookie that
  // carries a `Domain` attribute, so a sibling `*.grok.me` app cannot "toss" a
  // `Domain=.grok.me` session cookie onto this app. `__Host-` requires Secure +
  // Path=/ + no Domain; Better Auth otherwise uses `__Secure-` (which permits
  // Domain), so we drop its auto prefix (`useSecureCookies: false`) and set
  // Secure + the names ourselves. (Browsers allow Secure cookies on
  // `http://localhost`, so local dev still works.)
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-grok-auth.session_data" },
      account_data: { name: "__Host-grok-auth.account_data" },
      dont_remember: { name: "__Host-grok-auth.dont_remember" },
    },
  },

  plugins: [
    gateIdentitySessions(),

    // One genericOAuth provider per upstream (when auth is on), all federating
    // to the broker with the SAME client and differing only by the `idp` hint.
    ...(authBrokerOAuthPlugin ? [authBrokerOAuthPlugin] : []),

    // Accept `Authorization: Bearer <session-token>` as an alternative to the
    // cookie. Needed for the LIVE PREVIEW: the app runs in an embedded iframe
    // where cookies are partitioned, so after popup sign-in it authenticates with
    // a bearer token instead (see `client.ts` / the `auth` skill). The hook only
    // fires when an Authorization header is present, so the cookie path
    // (deployed apps) is unaffected.
    bearer(),

    // Bridges Better Auth's Set-Cookie into TanStack Start responses. MUST be
    // last so it runs after every other plugin's hooks.
    tanstackStartCookies(),
  ],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}

// Re-exported for convenience; the array lives in the dependency-free
// `providers.ts` so the client can import it too.
export { AUTH_PROVIDERS } from "./providers";
