---
title: "Environment Variables Reference"
---

For loading rules and source boundaries, see [Environment Variables](./environment-variables.md).

## Core Runtime Variables

| Variable | Purpose | Managed In |
|----------|---------|------------|
| `DATABASE_URL` | Postgres connection string | local `.env.db.*` or provider secret |
| `BETTER_AUTH_SECRET` | auth signing secret | local `.env.auth.*` or provider secret |
| `BETTER_AUTH_URL` | auth base URL | local env or generated Wrangler config |
| `BETTER_AUTH_TRUSTED_ORIGINS` | auth allowed origins | local env or generated Wrangler config |
| `BETTER_AUTH_COOKIE_DOMAIN` | auth cookie domain | local env or generated Wrangler config |
| `BETTER_AUTH_COOKIE_PREFIX` | auth cookie prefix | local env or generated Wrangler config |
| `ADMIN_BASE_URL` | admin base URL for generated links | local env or generated Wrangler config |
| `ADMIN_COOKIE_DOMAIN` | admin cookie domain | local env or generated Wrangler config |
| `ADMIN_ALLOWED_EMAILS` | admin allowlist | provider secret |
| `RESEND_SENDING_API_KEY` | transactional email | local env or provider secret |
| `VALBOT_SLACK_TOKEN` | Slack bot integration | local env or provider secret |
| `SLACK_CLIENT_ID` | admin Slack auth | local env or provider secret |
| `SLACK_CLIENT_SECRET` | admin Slack auth | local env or provider secret |
| `SLACK_TEAM_ID` | admin Slack auth | local env or provider secret |
| `LINEAR_API_KEY` | optional Linear integration | local env or provider secret |
| `LINEAR_FEEDBACK_TEAM_ID` | optional Linear feedback routing | local env or provider config |
| `LINEAR_FEEDBACK_LABEL_ID` | optional Linear feedback routing | local env or provider config |

## Client Variables

| Variable | Purpose |
|----------|---------|
| `VITE_ENV` | environment label |
| `VITE_STUDIO_URL` | studio URL used by client code |
| `VITE_APP_DOMAIN` | app host used for generated links |
| `VITE_POSTHOG_ENABLED` | analytics toggle |
| `VITE_POSTHOG_KEY` | PostHog project key |
| `VITE_POSTHOG_HOST` | PostHog host |
| `VITE_PRIVACY_POLICY_URL` | privacy policy URL |
| `VITE_TERMS_OF_SERVICE_URL` | terms URL |
| `VITE_STUDIO_SUPPORT_EMAIL` | support address shown in UI |
| `VITE_ASSET_BASE_URL` | preferred public asset host |
| `VITE_R2_PUBLIC_URL` | fallback asset host |
| `VITE_IMAGEKIT_URL` | ImageKit base URL |
| `VITE_IMAGE_DELIVERY_PROVIDER` | preferred image delivery provider |
| `VITE_IMAGE_PROVIDER` | legacy image provider fallback |

## Local Example Files

Tracked examples:

- `.env.defaults.example`
- `.env.local.example`
- `.env.selfhost.example`
- `.env.auth.local.example`
- `.env.db.dev.example`
- `.env.db.local.example`
- `.env.cloudflare.dev.example`
- `.env.posthog.local.example`
- `.env.resend.dev.example`

Local real files should use the same names without the `.example` suffix and stay untracked. The public repo does not auto-load those files; provide them from your shell, `direnv`, or your preferred dotenv workflow.

For deploy config generation and secret sync, see [Deployment Configuration](./deployment-configuration.md).
