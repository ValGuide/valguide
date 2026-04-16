---
title: "Session Cookie Caching"
---

ValGuide uses Better Auth session cookie caching with different settings per app context.

## Current Policy

- Studio/customer auth (`auth` in `packages/core/features/auth/better-auth.server.ts`):
  - `cookieCache.enabled: true`
  - `cookieCache.maxAge: 300` (5 minutes)
- Admin auth (`adminAuth` in `apps/admin/src/server/admin-auth.server.ts`):
  - `cookieCache.enabled: false`

## Why Split by Context

- Studio has high request volume from authenticated curator workflows, so caching reduces repeated session-table reads.
- Admin has higher security sensitivity (superadmin actions), so session checks always revalidate server-side.

## Security Model

Blocking users is enforced by policy checks, not only by session-row existence:

- Block action sets profile status to `blocked` and deletes existing sessions.
- Protected server functions check user status through middleware.
- OTP verification checks status and immediately tears down any newly created blocked-user session.

This means blocked users are denied even when session caching is enabled for Studio.

## Local Verification

To verify cache behavior locally:

1. Set `DRIZZLE_LOG_ENABLED=true`.
2. Restart `val dev studio`.
3. Sign in and navigate protected Studio routes.
4. Observe SQL logs and focus on `auth.session` queries.

Expected pattern with `maxAge: 300`:

- First protected request after sign-in: session-table read.
- Requests within 5 minutes: fewer/no repeated session-table reads for session lookup.
- First request after 5 minutes: session-table read appears again (cache refresh).

You can also inspect cookies in browser devtools:

- Look for `${BETTER_AUTH_COOKIE_PREFIX}.session_data`.
- Confirm it exists for Studio and is not used in admin when admin caching is disabled.
