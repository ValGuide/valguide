# Email Templates

- [react email](https://react.email/)
- [templates](https://demo.react.email/preview/notifications/vercel-invite-user?view=source)

## Run

Preview email templates in the browser:

```shell
pnpm run dev
```

Export email templates as html:

```shell
pnpm run export
```

_Notice:_ Email templates have to be exported and manually copied into the code base.
We cannot directly use the OTP email template as it messes up the edge middleware.

## Resend template sync

Sync localized templates to Resend:

```shell
pnpm --filter @valguide/email sync-templates
```

Provide the required Resend env vars from your shell or external dotenv tooling before running the sync.

Run a dry-run without publishing:

```shell
pnpm --filter @valguide/email sync-templates --dry-run
```

Aliases are locale-scoped:
- `otp-login-en`, `otp-login-de`, `otp-login-rm`
- `team-invite-en`, `team-invite-de`, `team-invite-rm`
