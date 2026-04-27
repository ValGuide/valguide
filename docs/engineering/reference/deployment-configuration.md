---
title: "Deployment Configuration"
---

ValGuide has two Wrangler config modes:

- committed `wrangler.jsonc` files are public-safe baselines for local dev, editor tooling, and `wrangler types`
- generated `wrangler.generated.jsonc` files are the only supported deploy configs

Generated configs are target-specific and environment-specific. They are ignored by git.

## Local Development

For a fresh checkout, copy `.env.local.example` to `.env.local` and edit the values you need. The modular `.env.*.example` files are still available when you prefer service-specific files.

The committed `apps/*/wrangler.jsonc` and `workers/*/wrangler.jsonc` files intentionally use local names, local domains, and dummy binding IDs. They should not contain hosted ValGuide routes or private resource IDs.

## Self-Hosting

Copy `.env.selfhost.example` to `.env.selfhost` and replace the placeholders with values from your own Cloudflare account and runtime providers.

Generate a deploy config for one target:

```sh
pnpm wrangler-config generate app --target-env prod --env-file .env.selfhost
```

Deploy commands in package scripts generate first and then deploy the generated config:

```sh
pnpm app:deploy
pnpm studio:deploy:dev
pnpm --filter @valguide/posthog-proxy deploy
```

The generated deploy command uses `wrangler deploy --config <target>/wrangler.generated.jsonc`. Do not add Wrangler's native `--env` flag to generated config deploys.

## Worker Secrets

Generated Wrangler configs never contain secret values. Push runtime secrets explicitly before first deploy and during rotations:

```sh
pnpm cloudflare-secrets push app --target-env prod --env-file .env.selfhost --dry-run
pnpm cloudflare-secrets push app --target-env prod --env-file .env.selfhost
```

Use `all` to validate or push every target's required secrets:

```sh
pnpm cloudflare-secrets push all --target-env prod --env-file .env.selfhost --dry-run
```

The helper prints secret names and status only. It does not print secret values.

## Hosted ValGuide

Hosted deployments run through GitHub Actions with GitHub Environments such as `app-dev`, `app-prod`, and `workers-prod`.

Use environment-scoped variable names without `DEV` or `PROD` suffixes:

- `POSTHOG_PROJECT_KEY`
- `CF_AUTH_KV_ID`
- `CF_TOUR_DATA_KV_ID`
- `CF_MAINTENANCE_KV_ID`
- `CF_LINKS_KV_ID`
- `CF_R2_BUCKET_NAME`
- `<TARGET>_WORKER_NAME`
- `<TARGET>_ROUTES`

Cloudflare resource IDs are mirrored from private infra outputs into GitHub environment variables by workspace operator scripts. Cloudflare Worker runtime secrets remain in Cloudflare Worker secrets and are pushed by an explicit rotation/setup step, not by normal deploy jobs.

