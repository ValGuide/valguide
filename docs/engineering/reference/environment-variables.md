---
title: "Environment Variables"
---

Environment variables live in **three different places**, each serving a different purpose. Understanding when to use which is critical to avoid bugs where the wrong value — or no value — reaches the code.

## The Three Sources

| Source | When it's read | What it feeds | Where to set |
|--------|---------------|---------------|--------------|
| **Wrangler `vars`** | Worker runtime | `process.env.*` → `serverEnv.*` | `apps/*/wrangler.jsonc` |
| **GitHub Actions `env`** | CI build time | `import.meta.env.VITE_*` → `clientEnv.*` | `.github/workflows/deploy-*.yml` |
| **Local `.env` files** | Local build time | `import.meta.env.VITE_*` → `clientEnv.*` | `.env`, `.env.local`, `.env.production.local` |

## How it works

### Build-time variables (`VITE_*`)

Vite **statically replaces** all `import.meta.env.VITE_*` references during `vite build`. The values are baked into the JavaScript bundle and shipped to the browser. They cannot change after build.

```
GitHub Actions env / local .env
        ↓ (build time)
   vite build
        ↓ (static replacement)
   import.meta.env.VITE_STUDIO_URL → "https://studio.valguide.com"
        ↓ (runtime)
   clientEnvSchema.parse(import.meta.env) → clientEnv.VITE_STUDIO_URL
```

**Where `VITE_*` vars are defined for CI builds:**
- `.github/workflows/deploy-*.yml` → `env:` block per job

**Where `VITE_*` vars are defined for local builds:**
- `.env` / `.env.local` / `.env.production.local` (Vite loads these automatically)

### Runtime variables (non-`VITE_*`)

Wrangler `vars` in `wrangler.jsonc` are injected into the Worker's `process.env` at runtime (requires `nodejs_compat` + `compatibility_date >= 2025-04-01`). These are read by server functions via `serverEnv.*`.

```
wrangler.jsonc vars
        ↓ (deploy time)
   Cloudflare Worker runtime
        ↓
   process.env.BETTER_AUTH_URL → serverEnv.BETTER_AUTH_URL
```

Secrets (like `DATABASE_URL`, `BETTER_AUTH_SECRET`) are set separately via `wrangler secret put <NAME>` and also appear in `process.env` at runtime.

## Rules

### `VITE_*` vars → GitHub Actions `env` (or local `.env`)

These are client-side variables baked into the JS bundle at build time:

- `VITE_POSTHOG_ENABLED`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`
- `VITE_STUDIO_URL`, `VITE_APP_DOMAIN`, `VITE_ENV`
- `VITE_ASSET_BASE_URL`, `VITE_R2_PUBLIC_URL`, `VITE_IMAGEKIT_URL`
- `VITE_IMAGE_DELIVERY_PROVIDER`, `VITE_IMAGE_PROVIDER`

**Do NOT put these in wrangler `vars`** unless they are also read server-side (see exception below).

### Non-`VITE_*` vars → Wrangler `vars`

These are server-side runtime variables:

- `NODE_ENV`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`
- `BETTER_AUTH_COOKIE_DOMAIN`, `BETTER_AUTH_COOKIE_PREFIX`, `APP_BASE_URL`
- `ADMIN_COOKIE_DOMAIN`, `ADMIN_BASE_URL`, `ADMIN_ALLOWED_EMAILS`

### Exception: `VITE_STUDIO_URL` in studio's wrangler

`VITE_STUDIO_URL` is in **both** places for the studio app because it's used at runtime by server functions that send invite emails (`invite-member.fn.ts`, `resend-invite.fn.ts` read `serverEnv.VITE_STUDIO_URL`). Other apps don't need it in wrangler vars.

## Validation

Both client and server env vars are validated at runtime through Zod schemas:

- **Client**: `packages/core/env/client.ts` → parses `import.meta.env` through `clientEnvSchema`
- **Server**: `packages/core/env/server.ts` → parses `process.env` through `serverEnvSchema`
- **Schemas**: `packages/core/env/schema.ts` defines both schemas with defaults and validation

If a required variable is missing, the app will throw an error at startup with details about which variables failed validation.

## Adding a new variable

1. **Determine if it's client or server:**
   - Client (browser needs it) → prefix with `VITE_`
   - Server (only server functions need it) → no prefix

2. **Add to the schema** in `packages/core/env/schema.ts`:
   - Client → `clientEnvSchema`
   - Server → `serverEnvSchema`

3. **Add to the right config:**
   - `VITE_*` → `.github/workflows/deploy-*.yml` `env:` blocks (prod + dev jobs)
   - `VITE_*` → local `.env` files for local development
   - Non-`VITE_*` → `apps/*/wrangler.jsonc` `vars` (prod + dev sections)
   - Secrets → `wrangler secret put <NAME>` (never commit these)

4. **Add to `nx.json`** in the `namedInputs.sharedGlobals` list so Nx includes the env var in task hashing

5. **Restart dev server** after adding new env vars
