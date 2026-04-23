---
title: "Environment Variables"
---

ValGuide uses three env sources:

| Source | Purpose | Lives in |
|--------|---------|----------|
| Root `.env.*` files | local development and local builds | untracked files at repo root |
| GitHub Actions `env` / repo variables | CI build-time values | GitHub Actions |
| Worker secrets and provider config | runtime secrets and Cloudflare bindings | Cloudflare / deploy platform |

## Local Development

This public repo does not ship real secrets. For local work, copy the example files at repo root:

- `.env.defaults.example` → `.env.defaults`
- `.env.auth.local.example` → `.env.auth.local`
- `.env.db.dev.example` → `.env.db.dev`
- `.env.db.local.example` → `.env.db.local`
- `.env.cloudflare.dev.example` → `.env.cloudflare.dev`
- `.env.posthog.local.example` → `.env.posthog.local`
- `.env.resend.dev.example` → `.env.resend.dev`

The public repo does not include a built-in secret loader. Provide local env values via your shell, `direnv`, your preferred dotenv tool, or CI/platform configuration.

## Runtime vs Build-Time

- `VITE_*` variables are build-time values baked into the browser bundle.
- non-`VITE_*` variables are server/runtime values read through `process.env`.
- sensitive values such as `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `ADMIN_ALLOWED_EMAILS` should come from provider-side secret stores, not from tracked files.

## Wrangler Config

The checked-in `wrangler.jsonc` files are public-safe examples plus app structure. They may still contain placeholder binding IDs that you must replace with your own Cloudflare resources before deploying.

## Adding a Variable

1. Add it to `packages/core/env/schema.ts`.
2. Decide whether it is build-time (`VITE_*`) or runtime.
3. Document a local example value in the relevant `*.example` file if contributors need it.
4. Add CI or provider-side secret configuration for deploys.
