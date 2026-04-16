---
title: "Environment Variables Reference"
---

Complete reference of all environment variables used across the ValGuide monorepo.

For how environment variables are loaded, validated, and where to set them, see [Environment Variables](./environment-variables.md).

## Server Variables

Set via `wrangler.jsonc` `vars` (non-secret) or `wrangler secret put` (secret). Validated by `serverEnvSchema` in `packages/core/env/schema.ts`. Admin-specific variables are validated by `adminEnvSchema` in `apps/admin/src/server/env.ts` (extends the base schema).

### Database

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `DATABASE_URL` | ✅ | ✅ | Neon Postgres connection string (pooled) | — |
| `DRIZZLE_LOG_ENABLED` | ❌ | ❌ | Enable Drizzle ORM query logging (`"true"` to enable) | `false` |

### Better Auth

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `BETTER_AUTH_SECRET` | ✅ | ✅ | Secret key for signing sessions and tokens | — |
| `BETTER_AUTH_URL` | ❌ | ❌ | Base URL for auth API endpoints | `""` |
| `BETTER_AUTH_TRUSTED_ORIGINS` | ❌ | ❌ | Comma-separated list of allowed origins for CORS/CSRF | `""` |
| `BETTER_AUTH_COOKIE_DOMAIN` | ❌ | ❌ | Cookie domain for regular auth (e.g., `.valguide.com`) | `""` |
| `BETTER_AUTH_COOKIE_PREFIX` | ❌ | ❌ | Cookie name prefix for regular auth | `valguide-auth` |
| `BETTER_AUTH_DEV_OTP` | ❌ | ❌ | Fixed OTP code for development (bypasses email sending) | `000000` |

### Admin Auth (Slack) — admin app only

Validated by `adminEnvSchema` in `apps/admin/src/server/env.ts` (extends base `serverEnvSchema`).

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `SLACK_CLIENT_ID` | ❌ | ✅ | Slack OAuth app client ID for admin login | `""` |
| `SLACK_CLIENT_SECRET` | ❌ | ✅ | Slack OAuth app client secret | `""` |
| `SLACK_TEAM_ID` | ❌ | ✅ | Slack workspace ID for team verification on admin login | `""` |
| `ADMIN_ALLOWED_EMAILS` | ❌ | ❌ | Comma-separated list of superadmin email addresses | `curator@museum-zurich.example,...` |
| `ADMIN_COOKIE_DOMAIN` | ❌ | ❌ | Cookie domain for admin auth (e.g., `ops.val.guide`) | — |
| `ADMIN_BASE_URL` | ❌ | ❌ | Base URL for admin app (used for OAuth callbacks) | `https://ops.val.guide` |

### Email (Resend)

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `RESEND_SENDING_API_KEY` | ❌ | ✅ | Resend API key for sending OTP and invitation emails | — |
| `EMAIL_FROM` | ❌ | ❌ | Sender address for transactional emails | `ValGuide <noreply@valguide.com>` |

### Integrations

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `VALBOT_SLACK_TOKEN` | ❌ | ✅ | Slack bot token for posting notifications | — |
| `USERS_SLACK_CHANNEL` | ❌ | ❌ | Channel for user/account lifecycle notifications | `users` / `users-dev` |
| `STUDIO_EVENTS_SLACK_CHANNEL` | ❌ | ❌ | Channel for founder-facing Studio activity notifications | `studio-events` / `studio-events-dev` |
| `STUDIO_FEEDBACK_SLACK_CHANNEL` | ❌ | ❌ | Channel for Studio feedback submissions | `studio-feedback` / `studio-feedback-dev` |
| `MAINTENANCE_SLACK_CHANNEL` | ❌ | ❌ | Channel for maintenance mode toggles | `maintenance` / `maintenance-dev` |

### App & Infra

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `NODE_ENV` | ❌ | ❌ | Runtime environment | `development` |
| `APP_BASE_URL` | ❌ | ❌ | Base URL for the visitor-facing app | `https://app.valguide.com` |
| `VITE_STUDIO_URL` | ❌ | ❌ | Studio URL (also in wrangler vars for studio — used server-side for invite emails) | `https://studio.valguide.com` |
| `BLOCK_ROBOTS` | ❌ | ❌ | Block search engine indexing (`"true"` for dev environments) | — |
| `DOCS_PASSWORD` | ❌ | ✅ | Password for docs site access | — |
| `STORYBOOK_PASSWORD` | ❌ | ✅ | Password for Storybook access | — |

### Cloudflare Tooling

These variables are used by repo scripts and local tooling that call the Cloudflare API directly.

| Variable | Required | Secret | Purpose | Default |
|----------|----------|--------|---------|---------|
| `CLOUDFLARE_ACCOUNT_ID` | ❌ | ✅ | Cloudflare account ID for account-scoped API calls | — |
| `CLOUDFLARE_API_TOKEN` | ❌ | ✅ | General Cloudflare API token used by infra scripts such as KV backfill and R2 CORS setup | — |
| `CLOUDFLARE_AI_TOKEN` | ❌ | ✅ | Dedicated Cloudflare API token for Workers AI operations such as agreeing to Meta model licenses | — |

## Client Variables (`VITE_*`)

Set via GitHub Actions `env` (CI builds) or local `.env` files. Baked into JS bundle at build time. Validated by `clientEnvSchema` in `packages/core/env/schema.ts`.

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_ENV` | Environment identifier (`local`, `dev`, `prod`) | `prod` |
| `VITE_POSTHOG_ENABLED` | Enable PostHog analytics (`"true"` to enable) | `false` |
| `VITE_POSTHOG_KEY` | PostHog project API key | — |
| `VITE_POSTHOG_HOST` | PostHog instance URL | — |
| `VITE_STUDIO_URL` | Studio app URL (used in client for navigation/links) | — |
| `VITE_APP_DOMAIN` | Visitor app domain (used for link generation) | `app.valguide.com` |
| `VITE_IMAGEKIT_URL` | ImageKit CDN base URL for image transforms | `https://ik.imagekit.io/valguide` |
| `VITE_STUDIO_SUPPORT_EMAIL` | Support email shown in studio UI | `support@valguide.com` |
| `VITE_R2_PUBLIC_URL` | Public URL for R2 asset storage | `https://assets.valguide.com` |
| `VITE_IMAGE_PROVIDER` | Image CDN provider (`cloudflare` or `imagekit`) | `imagekit` |

## Cloudflare Worker Bindings

Configured in `wrangler.jsonc` per app. These are not environment variables but runtime bindings.

| Binding | Type | Apps | Purpose |
|---------|------|------|---------|
| `TOUR_DATA` | KV | app, studio, admin | Tour data edge cache |
| `R2_BUCKET` | R2 | studio, admin | Asset storage (uploads, org logos) |

## Per-App Secret Matrix

Which secrets are pushed to Cloudflare Workers via `scripts/push-to-cloudflare.ts`:

| Secret | studio | app | www | links | admin | docs | storybook |
|--------|--------|-----|-----|-------|-------|------|-----------|
| `DATABASE_URL` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `BETTER_AUTH_SECRET` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `RESEND_SENDING_API_KEY` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `VALBOT_SLACK_TOKEN` | ✅ | ✅ | ✅ | ✅ | ✅ | — | — |
| `SLACK_CLIENT_ID` | — | — | — | — | ✅ | — | — |
| `SLACK_CLIENT_SECRET` | — | — | — | — | ✅ | — | — |
| `SLACK_TEAM_ID` | — | — | — | — | ✅ | — | — |
| `DOCS_PASSWORD` | — | — | — | — | — | ✅ | — |
| `STORYBOOK_PASSWORD` | — | — | — | — | — | — | ✅ |

## Local Development

Secrets are loaded from `.secrets/` directory via `scripts/load-env.ts`:

| File | Purpose | CLI flag |
|------|---------|----------|
| `.secrets/.env.neon.local` | Local Neon DB connection | `--db:local` |
| `.secrets/.env.neon.dev` | Dev Neon DB connection | `--db:dev` (default) |
| `.secrets/.env.neon.prod` | Prod Neon DB connection | `--db:prod` |
| `.secrets/.env.resend.dev` | Dev Resend API key | `--rs:dev` (default) |
| `.secrets/.env.resend.prod` | Prod Resend API key | `--rs:prod` |
| `.secrets/.env.cloudflare.dev` | Dev Cloudflare credentials | `--cf:dev` (default) |
| `.secrets/.env.cloudflare.prod` | Prod Cloudflare credentials | `--cf:prod` |
| `.secrets/.env.defaults` | Default values (always loaded) | — |

For Workers AI setup, add `CLOUDFLARE_AI_TOKEN` to the relevant `.secrets/.env.cloudflare.*` file alongside `CLOUDFLARE_ACCOUNT_ID`.
