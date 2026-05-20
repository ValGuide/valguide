---
title: "Environment Variables Reference"
---

For loading rules and source boundaries, see [Environment Variables](./environment-variables.md).

## Core Runtime Variables

| Variable | Required For | Secret? | Purpose | Managed In |
|----------|--------------|---------|---------|------------|
| `DATABASE_URL` | local app data, deploys for `admin`, `app`, `links`, `studio`, `www` | yes | Postgres connection string | local shell or provider secret |
| `BETTER_AUTH_SECRET` | local auth, deploys for `admin`, `app`, `links`, `studio`, `www` | yes | auth signing secret | local shell or provider secret |
| `BETTER_AUTH_URL` | local auth, deploys for auth-using apps | no | auth base URL | local env or generated Wrangler config |
| `BETTER_AUTH_TRUSTED_ORIGINS` | local auth, deploys for auth-using apps | no | auth allowed origins | local env or generated Wrangler config |
| `BETTER_AUTH_COOKIE_DOMAIN` | local auth, deploys for auth-using apps | no | auth cookie domain | local env or generated Wrangler config |
| `BETTER_AUTH_COOKIE_PREFIX` | local auth, deploys for auth-using apps | no | auth cookie prefix | local env or generated Wrangler config |
| `ADMIN_BASE_URL` | admin/studio deploys | no | admin base URL for generated links | local env or generated Wrangler config |
| `ADMIN_AUTH_MODE` | admin deploys | no | admin login provider: `credentials`, `slack`, or `both` | local env or generated Wrangler config |
| `ADMIN_COOKIE_DOMAIN` | admin deploys | no | admin cookie domain | local env or generated Wrangler config |
| `ADMIN_ALLOWED_EMAILS` | admin deploys and admin bootstrap | yes | admin allowlist | local shell or provider secret |
| `RESEND_SENDING_API_KEY` | transactional email deploys | yes | transactional email | local shell or provider secret |
| `VALBOT_SLACK_TOKEN` | optional Slack notifications | yes | Slack bot integration | local shell or provider secret |
| `SLACK_CLIENT_ID` | optional admin Slack auth | yes | Slack OAuth client ID | local shell or provider secret |
| `SLACK_CLIENT_SECRET` | optional admin Slack auth | yes | Slack OAuth client secret | local shell or provider secret |
| `SLACK_TEAM_ID` | optional admin Slack auth | yes | Slack OAuth workspace restriction | local shell or provider secret |
| `LINEAR_API_KEY` | optional Linear integration | yes | Linear API access | local shell or provider secret |
| `LINEAR_FEEDBACK_TEAM_ID` | optional Linear feedback routing | no | Linear feedback team | local env or generated Wrangler config |
| `LINEAR_FEEDBACK_LABEL_ID` | optional Linear feedback routing | no | Linear feedback label | local env or generated Wrangler config |

## Client Variables

`VITE_*` values are public build-time values. Treat them as deploy or local
configuration, not as secrets.

| Variable | Required For | Purpose |
|----------|--------------|---------|
| `VITE_ENV` | local and deploy builds | environment label |
| `VITE_STUDIO_URL` | studio/app workflows | studio URL used by client code |
| `VITE_APP_DOMAIN` | generated app links | app host used for generated links |
| `VITE_POSTHOG_ENABLED` | optional analytics | analytics toggle |
| `VITE_POSTHOG_KEY` | optional analytics | PostHog project key |
| `VITE_POSTHOG_HOST` | optional analytics | PostHog host |
| `VITE_PRIVACY_POLICY_URL` | public apps | privacy policy URL |
| `VITE_TERMS_OF_SERVICE_URL` | public apps | terms URL |
| `VITE_STUDIO_SUPPORT_EMAIL` | studio UI | support address shown in UI |
| `VITE_ASSET_BASE_URL` | optional image delivery | preferred public asset host |
| `VITE_R2_PUBLIC_URL` | optional image delivery | fallback asset host |
| `VITE_IMAGEKIT_URL` | optional ImageKit delivery | ImageKit base URL |
| `VITE_IMAGE_DELIVERY_PROVIDER` | optional image delivery | preferred image delivery provider |
| `VITE_IMAGE_PROVIDER` | optional image delivery | legacy image provider fallback |

## Local Example Files

Tracked examples:

- `.env.local.example`
- `.env.selfhost.example`

Local real files should use the same names without the `.example` suffix and stay untracked. The public repo does not auto-load those files; provide them from your shell, `direnv`, or your preferred dotenv workflow.

For deploy config generation and secret sync, see [Deployment Configuration](./deployment-configuration.md).
