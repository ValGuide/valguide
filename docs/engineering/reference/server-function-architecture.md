---
title: "Server Function Architecture"
---

**Status:** Adopted  
**Date:** January 2026

---

## Overview

ValGuide uses a **use-case-per-file** pattern with **separated server logic** for TanStack Start compatibility. This architecture prioritizes:
- LLM discoverability (filename = function name)
- Small context windows (50-150 lines per file)
- Proper tree-shaking (server code never leaks to client)

---

## File Pattern

Each operation uses two files:

```
domain/
├── create-tour.server.ts   # DB logic + types
├── create-tour.fn.ts       # Server function only
├── get-tour.server.ts
├── get-tour.fn.ts
└── ...
```

| Suffix | Contains | Who imports |
|--------|----------|-------------|
| `.server.ts` | DB logic + types | Only `.fn.ts` in same feature |
| `.fn.ts` | Server function + re-exported types | Routes, components, other features |

**The `.fn.ts` is the public API. The `.server.ts` is an implementation detail.**

---

## Why Two Files?

TanStack Start's tree-shaking only removes code **referenced inside the server function handler**. If a file exports both a server function AND an internal function that uses `db` or `serverEnv`, importing that internal function from another file pulls ALL imports—including server-only ones—breaking the client build.

**Error you'll see:**
```
Failed to resolve import "tanstack-start-injected-head-scripts:v"
```

**The fix:** Separate DB logic into `.server.ts` files that clients never import directly.

---

## File Contents

### `.server.ts` — DB Logic + Types

```typescript
// create-tour.server.ts
import { db } from '@valguide/core/features/db'
import { valguideId } from '@valguide/core/utils/nanoid'
import { guide, guideLocale, guideLocaleDraft } from '../schema'

// Types
export type CreateGuideInput = {
  title: string
  locale: string
}

export type CreateGuideResult = {
  nanoId: string
  locale: string
}

// DB logic
export async function createGuide(
  input: CreateGuideInput,
  organizationId: string,
  userId: string,
): Promise<CreateGuideResult> {
  return db.transaction(async (tx) => {
    const nanoId = valguideId()
    // ... DB operations
    return { nanoId, locale: input.locale }
  })
}
```

### `.fn.ts` — Server Function + Re-exported Types

```typescript
// create-tour.fn.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { requireOrgMember } from '@valguide/core/features/auth/authorization'
import { createGuide } from './create-tour.server'

// Re-export types for clients
export type { CreateGuideInput, CreateGuideResult } from './create-tour.server'

const createGuideSchema = z.object({
  title: z.string().min(1),
  locale: z.string().default('en'),
})

export const createGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createGuideSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId!
    await requireOrgMember(orgId, context.user.id)
    return createGuide(data, orgId, context.user.id)
  })
```

---

## Import Rules

```typescript
// ✅ Client/routes — import from .fn.ts only
import { createGuideFn, type CreateGuideInput } from '@valguide/core/features/guides/guide/create-tour.fn'

// ✅ Server-to-server (other .fn.ts or .server.ts files)
import { createGuide } from './create-tour.server'

// ❌ NEVER in client code — breaks build
import { createGuide } from '@valguide/core/features/guides/guide/create-tour.server'
```

---

## Folder Structure

### Simple Feature (Flat)

```
assets/
├── schema.ts
├── types.ts                      # Shared base types
├── get-assets.server.ts          # DB logic
├── get-assets.fn.ts              # Server function
├── get-asset.server.ts
├── get-asset.fn.ts
├── confirm-upload.server.ts
├── confirm-upload.fn.ts
├── delete-asset.server.ts
├── delete-asset.fn.ts
├── utils.ts                      # Pure helpers (no DB)
└── components/
```

### Complex Feature (Domain Subdirectories)

```
guides/
├── schema.ts
├── relations.ts
├── types.ts
│
├── guide/
│   ├── create-tour.server.ts
│   ├── create-tour.fn.ts
│   ├── get-tour.server.ts
│   ├── get-tour.fn.ts
│   ├── locale/
│   │   ├── get-tour-locale-draft.server.ts
│   │   ├── get-tour-locale-draft.fn.ts
│   │   └── ...
│   ├── settings/
│   │   └── ...
│   └── asset/
│       └── ...
│
├── stop/
│   └── ...
│
├── structure/
│   └── ...
│
├── utils.ts
└── components/
```

---

## Naming Conventions

| Pattern | Example |
|---------|---------|
| **Server file** | `create-tour.server.ts` |
| **Function file** | `create-tour.fn.ts` |
| **Internal function** | `createGuide()` |
| **Server function** | `createGuideFn` |
| **Input type** | `CreateGuideInput` |
| **Result type** | `CreateGuideResult` |

### Filename Pattern

```
{verb}-{noun}.server.ts
{verb}-{noun}.fn.ts
```

Common verbs: `create`, `get`, `list`, `update`, `delete`, `archive`, `recover`, `publish`, `unpublish`, `rollback`, `assign`, `remove`, `reorder`

---

## Slack Notifiers

When a server action sends a Slack notification, use the notifier pattern:
- callers `await notify...(...)`
- notifier helpers catch and log internally
- transport may throw

```typescript
// ✅ GOOD
await notifyTourCreated({
  actorEmail: context.user.email ?? null,
  locale: result.locale,
  organizationId: orgId,
  tourNanoId: result.nanoId,
})

// ❌ BAD
notifyTourCreated(payload).catch((error) => {
  console.error('Failed to send Slack notification:', error)
})
```

Do not move DB-backed notifier helpers into `waitUntil`. Resolve DB data inline first, then defer only transport-only work if needed.

---

## Types Placement

| Type Category | Location | Example |
|---------------|----------|---------|
| **Shared base types** | `types.ts` | `Guide`, `Stop`, `Asset` |
| **Operation-specific** | `.server.ts` (re-exported from `.fn.ts`) | `CreateGuideInput`, `GuideListItem` |

**Rule:** If a type is used across multiple operations → `types.ts`. If only used by one operation → collocate in `.server.ts`.

---

## File Size Guidelines

| Metric | Target |
|--------|--------|
| Lines per `.server.ts` | 30-100 |
| Lines per `.fn.ts` | 20-50 |
| Combined | 50-150 max |

If files exceed these limits, consider splitting into more granular operations.

---

## What NOT to Do

### ❌ Mix DB Logic in `.fn.ts`

```typescript
// DON'T — breaks tree-shaking
// create-tour.fn.ts
import { db } from '../db'  // Server-only import in .fn.ts!

export async function createGuide() { ... }  // DB logic here
export const createGuideFn = createServerFn(...)
```

### ❌ Import `.server.ts` in Client Code

```typescript
// DON'T — breaks client build
import { createGuide } from './create-tour.server'
```

### ❌ Barrel Files

```typescript
// DON'T
export * from './create-tour.fn'
export * from './get-tour.fn'
```

### ❌ Star Imports

```typescript
// DON'T
import * as queries from './queries'

// DO
import { getGuideFn, type GuideDetail } from './get-tour.fn'
```

---

## Benefits Summary

1. **Tree-shaking works**: Server code never leaks to client bundle
2. **Discoverability**: `grep createGuide` → finds `create-tour.fn.ts`
3. **Context efficiency**: Two small files = full context for LLMs
4. **Single import path**: Clients only import from `.fn.ts`
5. **Testability**: `.server.ts` functions are pure DB logic, easy to test

---

## Authorization

Every server function MUST have proper auth. The pattern uses middleware + helper functions.

### Auth Middleware

```typescript
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'

export const myFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])  // ← REQUIRED for protected endpoints
  .handler(async ({ context }) => {
    // context.user is typed as AuthUser (non-null)
    // context.activeOrgId is the current team from cookie
  })
```

| Middleware | Use Case |
|------------|----------|
| `authContextMiddleware` | Public routes with conditional UI (user may be null) |
| `requireAuthMiddleware` | All protected server functions (throws redirect if unauthenticated) |

### Entity Access Checks

After middleware, call an access check helper to verify org membership:

```typescript
import { requireTourAccess, requireOrgMember } from '@valguide/core/features/auth/authorization'

// Check user can access a specific tour
await requireTourAccess(tourId, context.user.id)

// Check user can access a specific stop
await requireStopAccess(stopId, context.user.id)

// For role-based actions (publishing requires curator+)
await requireOrgRole(organizationId, context.user.id, 'curator')
```

### Available Access Functions

| Function | Purpose |
|----------|---------|
| `requireOrgMember(orgId, userId)` | Verify user is org member |
| `requireOrgRole(orgId, userId, minRole)` | Verify minimum role (owner > admin > curator > editor > viewer) |
| `requireTourAccess(tourId, userId)` | Verify access via tour's org |
| `requireTourAccessByNanoId(nanoId, userId)` | Same, by nanoId |
| `requireStopAccess(stopId, userId)` | Verify access via stop's org |
| `requireStopAccessByNanoId(nanoId, userId)` | Same, by nanoId |
| `requireAssetAccess(assetId, userId)` | Verify access via asset's org |
| `requireThemeAccess(themeId, userId)` | Verify access via theme's org |

### Error Types

All access functions throw typed errors:

```typescript
class UnauthenticatedError  // 401 - Not logged in
class ForbiddenError        // 403 - Logged in but no access
class NotFoundError         // 404 - Entity doesn't exist
```

### Complete Example

```typescript
// update-tour.fn.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '@valguide/core/features/auth/middleware'
import { requireTourAccess } from '@valguide/core/features/auth/authorization'
import { updateTour } from './update-tour.server'

export const updateTourFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])                    // 1. Auth middleware
  .inputValidator(z.object({ tourId: z.string(), title: z.string() }))
  .handler(async ({ context, data }) => {
    await requireTourAccess(data.tourId, context.user.id) // 2. Entity access check
    return updateTour(data.tourId, { title: data.title })
  })
```

For full authorization architecture details, see [.agents/plans/done/unified-authorization-layer.md](../.agents/plans/done/unified-authorization-layer.md).
