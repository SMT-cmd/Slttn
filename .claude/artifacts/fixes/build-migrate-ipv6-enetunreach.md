# Bug: Build-time migrate IPv6 ENETUNREACH kills deploy

> Status: FIXED
> Mode: (default)
> Severity: blocker
> Author: Codex
> Last updated: 2026-09-29

## Symptom
`npm run build` succeeded through the Vite/Nitro phase, then failed in `db:migrate` when Postgres resolved to an unreachable IPv6 address during Vercel build.

## Expected
Build-time migrations should still run when `DATABASE_URL` is reachable, but deploys should not fail solely because the build environment cannot reach the database over the network.

## Reproduction
- Command / steps: run `node scripts/migrate.mjs` with a transient connection failure such as `ENETUNREACH`, `ECONNREFUSED`, or connection timeout.
- Test location: `scripts/migrate.test.mjs`
- Repro stability: deterministic via injected fake pool errors.

## Hypotheses & diagnosis
| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| H1 | `scripts/migrate.mjs` treats transient connection errors the same as real migration failures and exits non-zero. | confirmed (root cause) | `main().catch(...)` always called `process.exit(1)` after logging any error. |
| H2 | The repo was still using a non-IPv4-friendly Postgres pool config for migrations. | eliminated | `scripts/migrate.mjs` already uses `createPostgresPoolConfig(...)`, and `scripts/postgres-config.test.mjs` confirms `family: 4`. |

## Root cause
The migrator already preferred IPv4 by building the pool with `createPostgresPoolConfig`, but any connection-time error still bubbled to a hard `process.exit(1)`. That made transient build-network failures indistinguishable from real SQL or code errors, so Vercel deploys failed after the app build had already succeeded.

## Fix
- Changed files: `scripts/migrate.mjs`, `scripts/migrate.test.mjs`, `src/routes/__root.tsx`
- One-line summary: refactored the migrator into testable functions, kept reachable migrations running, soft-failed only for transient build connectivity errors, and pointed favicon/meta icon links at the real logo asset.

## Verification
- V-1: `node --test scripts/postgres-config.test.mjs scripts/migrate.test.mjs` -> GREEN
- V-2: `npm run typecheck` -> GREEN
- V-3: `npm run build` -> GREEN, with `[migrate] DATABASE_URL not set — skipping.`

## Regression test
- Path: `scripts/migrate.test.mjs`
- Names:
  - `skips cleanly when DATABASE_URL is missing`
  - `runs pending migrations with IPv4-friendly pool config when DATABASE_URL is reachable`
  - `returns success for transient DB connectivity failures during build`
  - `keeps real migration errors fatal`

## Pattern analysis
| Search way | Hits | Same-class risk |
|---|---|---|
| `git grep -n "createPostgresPoolConfig(" src scripts` | 4 | No additional migrate path; the only other runtime `pg` pool is `src/lib/auth/server.ts`, which already centralizes IPv4 forcing through the shared helper. |

