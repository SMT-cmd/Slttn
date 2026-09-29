# Bug: Vercel build fails in db:migrate on IPv6-only Postgres resolution

> Status: FIXED
> Mode: (default)
> Severity: blocker
> Author: user
> Last updated: 2026-09-29

## Symptom
`npm run build` completed the Vite/Nitro output, then failed in `db:migrate` with `connect ENETUNREACH 2a05:d014:1577:8801::9ca4:5432`.

## Expected
The deploy build should complete without failing when the database hostname resolves IPv6 first on a runtime that only has IPv4 egress.

## Reproduction
- Command / steps: run `npm run build` with a `DATABASE_URL` that resolves to an IPv6-first Postgres host.
- Test location: `scripts/postgres-config.test.mjs`
- Repro stability: regression test fails 2/2 when the helper is changed away from `family: 4`, then passes again after restore.

## Hypotheses & diagnosis
| # | Hypothesis | Verdict | Evidence |
|---|---|---|---|
| H1 | The deploy migrator uses a direct Postgres client that prefers an unreachable IPv6 address. | confirmed (root cause) | The failure happens after Nitro output, exactly at `scripts/migrate.mjs`, and the error target is an IPv6 address with `ENETUNREACH`. |
| H2 | The build is failing because Vercel output generation is broken. | eliminated | `npm run build` reaches `Generated .vercel/output/nitro.json` before failing. |

## Root cause
The app still had two direct `pg` connection paths: the deploy-time migrator and the Better Auth runtime database adapter. Both used only `connectionString`, so when the host resolved an IPv6 address first, Node attempted that route and failed before reaching a usable IPv4 path. The failure surfaced during `db:migrate`, but auth had the same latent risk.

## Fix
- Changed files: `scripts/migrate.mjs`, `src/lib/auth/server.ts`, `src/lib/postgres-config.js`, `scripts/postgres-config.test.mjs`
- One-line summary: centralize Postgres pool creation and force `family: 4` for all direct `pg` connections.
- Code diff summary:
  - add `createPostgresPoolConfig()` in `src/lib/postgres-config.js`
  - use that helper in `scripts/migrate.mjs`
  - use that helper in `src/lib/auth/server.ts`
  - add `scripts/postgres-config.test.mjs` regression coverage

## Verification
- V-1: `node --test scripts/postgres-config.test.mjs` -> GREEN
- V-2: temporarily changed the helper to `family: 6` -> test RED, restored `family: 4` -> GREEN
- V-3: `npm run typecheck` -> GREEN
- V-4: `npm run build` -> GREEN, including `db:migrate` path (`DATABASE_URL not set` skip in local verification)

## Regression test
- Path: `scripts/postgres-config.test.mjs`
- Name: `Postgres pool config forces IPv4 for managed hosts that resolve IPv6 first`

## Pattern analysis
This root cause is a direct-Postgres-connection pattern, so I searched for all `pg` pool constructors.

| Search way | Hits | Same class of risk |
|---|---:|---|
| `new Pool(` / `new pg.Pool(` | 2 | yes, both fixed in this change |
| `family: 4` | 3 | helper + 2 assertions in regression tests |

## Open questions / Follow-ups
- The project has unrelated existing workspace changes in `.trae-html-share-packages/scripts/install-page.html.zip`; this fix leaves them untouched.
- `src/routeTree.gen.ts` regenerated during verification to include existing `faq` and `support` routes; keep it with the route files.
