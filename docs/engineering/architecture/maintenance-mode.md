---
title: "Maintenance Mode"
---

This document describes how maintenance mode works across ValGuide runtime apps.

Scope:
1. `app` runtime (`app.valguide.com` / `app.valguide.dev`)
2. `studio` runtime (`studio.valguide.com` / `studio.valguide.dev`)
3. Admin control plane (`ops.val.guide` / `ops-dev.val.guide`)

## Goals

1. Toggle maintenance independently for app and studio.
2. Block both document requests and backend requests centrally.
3. Avoid per-endpoint checks in route handlers and server functions.
4. Keep operator workflow simple and reversible.

## Architecture

Maintenance mode is enforced in request middleware, not in feature code.

1. Source of truth is Cloudflare KV binding `MAINTENANCE`.
2. Keys are app-scoped:
1. `ops:maintenance:studio`
1. `ops:maintenance:app`
3. `app` and `studio` each attach `createMaintenanceRequestMiddleware(...)` in `start.ts`.
4. Middleware checks maintenance state once per request path, with short in-memory TTL caching (5 seconds per isolate).
5. Admin writes maintenance state through protected server functions.

## Data Model

KV value (JSON):

```ts
type MaintenanceState = {
  enabled: true
  message: string | null
  eta: string | null
  enabledAt: string
  enabledBy: string | null
}
```

Notes:
1. Disabled state is represented by deleting the key.
2. `enabledAt` is ISO timestamp.
3. `message` and `eta` are optional.

## Request Handling Behavior

When maintenance is disabled:
1. Request continues normally.

When maintenance is enabled:
1. Document requests (`GET` + HTML navigation) return branded maintenance HTML with status `503`.
2. The maintenance page has app-specific copy variants (`studio` for curators, `app` for visitors) loaded directly from `packages/core/i18n/messages/*.json` with code-level fallback strings for resilience.
3. Theme is resolved from the same app cookie used in normal runtime (`valguide-studio-theme` / `valguide-app-theme`) and applied to the static maintenance HTML.
4. API/server-function requests return JSON payload with status `503`:
1. `{ "error": "maintenance_mode", "app": "...", "message": "...", "eta": "..." }`
5. Response headers include:
1. `Cache-Control: no-store`
2. `Retry-After: 120`
3. `X-Maintenance-App: app|studio`

Bypass behavior:
1. Static asset paths are bypassed.
2. Health-style prefixes are bypassed by default (`/health`, `/_health`).

## Admin Control Plane

Route: `/maintenance` in admin.

Capabilities:
1. Toggle studio maintenance on/off.
2. Toggle app maintenance on/off.
3. Set optional message and ETA.
4. Display current status, enabled timestamp, and actor.

Server functions:
1. `getMaintenanceStatusFn` returns both app statuses.
2. `setMaintenanceStatusFn` updates target app status.
3. Calls are protected by `adminMiddleware` (superadmin-only).

## Notifications

Each toggle sends a Slack message to `valguide-users`:
1. target app
2. enabled/disabled state
3. actor email
4. message + ETA (if set)

## Emergency Override

Emergency env flags force maintenance mode even if KV is disabled:
1. `MAINTENANCE_FORCE_STUDIO`
2. `MAINTENANCE_FORCE_APP`

Accepted true-like values: `1`, `true`, `yes`, `on` (case-insensitive).

This is intended for outage response and should be removed after incident resolution.

## Configuration

Wrangler bindings required in all three apps (`app`, `studio`, `admin`):
1. Prod KV namespace: `MAINTENANCE`
2. Dev KV namespace: `dev-MAINTENANCE`

Binding name in config:
1. `MAINTENANCE`

Current `wrangler.jsonc` files include placeholder IDs for MAINTENANCE namespaces and must be replaced with real IDs before deploy.

## Operational Runbook

Normal planned maintenance:
1. Open admin `/maintenance`.
2. Enable maintenance for target runtime.
3. Optionally set message + ETA.
4. Verify a page request returns HTML `503`.
5. Verify an API/server-function call returns JSON `503`.
6. Perform maintenance work.
7. Disable maintenance.
8. Verify normal traffic restored.

Incident/emergency:
1. Set `MAINTENANCE_FORCE_STUDIO=true` and/or `MAINTENANCE_FORCE_APP=true` in environment.
2. Redeploy affected worker.
3. Remove flag after incident and redeploy again.

## Validation Checklist

1. Studio ON, App OFF.
2. Studio OFF, App ON.
3. Both ON.
4. Both OFF.
5. Admin remains accessible during app/studio maintenance.
6. Slack notification sent for each toggle.
