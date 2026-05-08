---
title: "Deployment Configuration"
---

ValGuide has two Wrangler config modes:

- committed `wrangler.jsonc` files are public-safe baselines for local dev, editor tooling, and `wrangler types`
- generated `wrangler.generated.jsonc` files are the only supported deploy configs

Generated configs are target-specific and environment-specific. They are ignored by git.

## Local Development

For a fresh checkout, copy `.env.local.example` to `.env.local` and edit the values you need.

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

## Self-Hosted Admin Login

Self-hosted admin deployments should use `ADMIN_AUTH_MODE=credentials` unless they intentionally configure their own Slack OAuth app. `ADMIN_ALLOWED_EMAILS` remains the superadmin allowlist in both modes.

After database migrations have run, bootstrap or rotate the admin credential from an environment that can reach the database:

```sh
export DATABASE_URL='postgres://<user>:<password>@<host>:5432/<database>'
export ADMIN_ALLOWED_EMAILS='admin@example.com'
read -s ADMIN_PASSWORD
export ADMIN_PASSWORD
pnpm --filter @valguide/core admin:bootstrap -- --email admin@example.com
unset ADMIN_PASSWORD
```

The bootstrap command stores a Better Auth password hash in the auth tables. Do not commit, log, or keep the raw admin password in tracked env files.

## Hosted ValGuide

Hosted ValGuide deployments are intentionally not run from this public
repository. Public GitHub Actions validate code and may create release tags,
but hosted Cloudflare deployment, hosted environment variables, provider
credentials, and Slack notifications live in private ValGuide deployment
orchestration.

This keeps public workflow logs free of hosted deployment configuration. The
public repo can still be self-hosted with generated Wrangler configuration and
operator-provided secrets as described above.
