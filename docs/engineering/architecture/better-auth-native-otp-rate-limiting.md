---
title: "Better Auth Native OTP Rate Limiting"
---

This document defines ValGuide's OTP authentication architecture after moving to Better Auth native client-initiated flows.

Scope:
1. Studio OTP login flow.
2. Route-level OTP abuse protection.
3. Auth-side observability hooks.

## Architecture Summary

ValGuide uses Better Auth as the single auth transport and policy layer for OTP.

1. Client sends OTP and verifies OTP directly against Better Auth endpoints at `/api/auth/*`.
2. Better Auth enforces OTP route limits through `rateLimit.customRules`.
3. Better Auth hooks emit Slack side effects for login-started and login-success events.
4. Studio route/server-function access control remains enforced by existing auth middleware and user status checks (`approved`/`pending`/`blocked`).
5. UI error handling reads retry timing from `X-Retry-After` to show localized wait durations.

This removes OTP proxy server functions and avoids custom throttling infrastructure.

## Request Flow

### Send OTP

1. Browser calls `POST /api/auth/email-otp/send-verification-otp`.
2. Better Auth applies rate limiting for the endpoint.
3. Better Auth email OTP plugin generates and stores OTP, then sends email via configured sender.
4. Better Auth `after` hook emits "login started" Slack event only on successful OTP-send response (best-effort).

### Verify OTP

1. Browser calls `POST /api/auth/sign-in/email-otp`.
2. Better Auth applies rate limiting for the endpoint.
3. Better Auth validates OTP and creates session cookies.
4. Better Auth `after` hook checks `newSession` and emits "login success" Slack event (best-effort).
5. App navigation continues; protected routes and server middleware enforce account status.

## Rate Limiting Policy

Limits are path-specific and environment-sensitive.

Production:
1. `/email-otp/send-verification-otp`: 3 requests per 60 seconds.
2. `/sign-in/email-otp`: 5 requests per 60 seconds.
3. `/email-otp/check-verification-otp`: 5 requests per 60 seconds.

Development:
1. Same paths enabled with less restrictive thresholds to reduce local friction.
2. Current implementation values:
1. send OTP: 20 requests per 60 seconds
1. verify/check OTP: 30 requests per 60 seconds

Client-side display:
1. Rate-limit responses parse `X-Retry-After` via Better Auth client `fetchOptions.onError`.
2. Localized messages render seconds/minutes with singular/plural forms in EN/DE/RM.

Policy notes:
1. Rate limiting must remain enabled for client-facing auth routes.
2. OTP limits are enforced at Better Auth route layer, not in app-level server functions.

## Hooks and Side Effects

Hooks are used for non-critical observability side effects.

1. `before` hook:
1. Path match: `/email-otp/send-verification-otp`.
1. Action: post "user started login" to Slack.
2. `after` hook:
1. Path match: `/sign-in/email-otp`.
1. Condition: `newSession` present.
1. Action: post "user logged in" to Slack.

Implementation detail:
1. "Login started" is implemented in `hooks.after` (not `hooks.before`) to ensure events are emitted only when OTP-send succeeds.

Hook rules:
1. Side effects are best-effort and must not block auth response.
2. Failures in Slack delivery must never fail authentication.

## Security Boundaries

1. Better Auth route limits protect against OTP endpoint abuse.
2. Email OTP `allowedAttempts` remains active for OTP attempt constraints.
3. Middleware-enforced account status remains source of truth for access decisions.
4. CAPTCHA is out of scope for current implementation.

## Operational Guidance

1. Verify rate limits in production-like environments with repeated send/verify requests.
2. Monitor auth logs and Slack event volume for abuse patterns and false positives.
3. Tune production and development thresholds independently as needed.

## Migration Notes

Removed components:
1. OTP transport server function wrappers that called `auth.api.sendVerificationOTP` and `auth.api.signInEmailOTP`.

Retained components:
1. Better Auth server configuration and OTP plugin.
2. Existing auth middleware status enforcement (`pending` and `blocked` routing).
