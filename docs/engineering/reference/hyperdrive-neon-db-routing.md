---
title: "Hyperdrive + Neon DB Routing"
---

This document describes the repo-specific setup to route `app`, `studio`, and `admin` database traffic through Cloudflare Hyperdrive backed by Neon.

## Scope

- Applies to Worker runtime DB calls from `apps/app`, `apps/studio`, and `apps/admin`
- Keeps local scripts and Drizzle CLI workflows on direct `DATABASE_URL`
- Preserves existing Better Auth architecture (regular user auth + isolated admin Slack auth)

## Runtime Behavior

The DB layer in `packages/core/features/db.ts` now supports three modes via `DB_CONNECTION_MODE`:

- `auto` (default): use Hyperdrive when the worker provides a Hyperdrive connection string, otherwise fallback to direct `DATABASE_URL`
- `hyperdrive`: require Hyperdrive (throws if missing)
- `direct`: always use `DATABASE_URL`

Each worker isolate logs the selected path once:

```txt
[db] Using hyperdrive connection (auto mode)
```

or

```txt
[db] Using direct connection (auto mode)
```

## Files Updated

- `packages/core/features/db.ts` — dual-path DB resolver + Hyperdrive runtime configurator
- `packages/core/env/schema.ts` — `DB_CONNECTION_MODE` schema
- `apps/app/src/start.ts` — passes Hyperdrive connection string into core DB config
- `apps/studio/src/start.ts` — passes Hyperdrive connection string into core DB config
- `apps/admin/src/start.ts` — passes Hyperdrive connection string into core DB config
- `apps/app/wrangler.jsonc` — dev Hyperdrive binding scaffold
- `apps/studio/wrangler.jsonc` — dev Hyperdrive binding scaffold
- `apps/admin/wrangler.jsonc` — dev Hyperdrive binding scaffold
- `nx.json` — adds `DB_CONNECTION_MODE` to `namedInputs.sharedGlobals`

## Cloudflare Setup

Create Hyperdrive configs (recommended: one per environment) with caching disabled for auth-heavy traffic:

```bash
pnpm dlx wrangler hyperdrive create valguide-neon-dev --connection-string="postgres://..." --caching-disabled
pnpm dlx wrangler hyperdrive create valguide-neon-prod --connection-string="postgres://..." --caching-disabled
```

Then replace the placeholder id `00000000-0000-0000-0000-000000000000` in each app's `wrangler.jsonc` `env.dev.hyperdrive[0].id` with your real dev config id.

## Rollout Sequence

1. Set `DB_CONNECTION_MODE=auto` everywhere (safe default).
2. Configure real Hyperdrive IDs in `env.dev` for `admin`, `studio`, `app`.
3. Deploy and validate in this order: `admin` then `studio` then `app`.
4. After dev validation, add production Hyperdrive bindings and deploy in same order.
5. Optionally move to `DB_CONNECTION_MODE=hyperdrive` after full confidence.

## Validation Checklist

- Admin Slack login + protected admin queries work
- Studio OTP login/invite/team flows work
- App public data reads work
- Better Auth session checks still hit DB correctly
- No stale-read issues in write-then-read paths
- Worker logs show expected DB path

## Rollback

Immediate rollback path:

1. Set `DB_CONNECTION_MODE=direct`
2. Redeploy affected app

No schema migration or auth-logic rollback is needed for this transport-level rollback.
