---
title: "Entity Creation Mutation Pattern"
---

## Overview

For create-then-edit flows, trigger creation from the current screen with an explicit mutation, then navigate to the edit route after success.

## Pattern

```
/tours                          → createTourFn() → /tours/:nanoId/edit
/tours/:tourId/edit             → createStopFn() + addStopToTourFn() → /tours/:tourId/stops/:stopId/edit
```

## Why This Pattern?

### Problems with mutation-in-loader `/new` routes
- They put a write on the navigation critical path
- They often trigger extra invalidation work before redirecting away
- They hide pending/error state in route transitions instead of at the button
- They make create flows slower without improving the edit route itself

### Benefits of explicit client-side mutations
1. **Fast navigation path** - create, then navigate directly
2. **Local pending state** - button and section feedback stay contextual
3. **Cleaner route responsibilities** - edit routes only load existing entities
4. **Better control over cache strategy** - no forced pre-redirect invalidation

## Implementation

### Mutation Structure

```typescript
// tours list page
import { useMutation } from '@tanstack/react-query'
import { createTourFn } from '@valguide/core/features/tours/tour/create-tour.fn'

const createTour = useMutation({
  mutationFn: async (locale: string) => createTourFn({ data: { locale } }),
  onSuccess: (result) => {
    router.navigate({
      to: '/tours/$nanoId/edit',
      params: { nanoId: result.nanoId },
      search: { locale: result.locale },
    })
  },
})
```

### Key Points

1. **Creation starts from user intent** on the current page
2. **Server generates ID** - no client-side `valguideId()` needed
3. **Navigation happens only after success**
4. **List invalidation is not on the hot path**

### Edit Route (Clean)

```typescript
// routes/_main/tours.$nanoId.edit.tsx
export const Route = createFileRoute('/_main/tours/$nanoId/edit')({
  loader: async ({ params, context }) => {
    // No creation logic - just fetch existing entity
    const tourDetail = await context.queryClient.ensureQueryData(
      tourDetailQueryOptions(params.nanoId)
    )
    if (!tourDetail) throw notFound()
    return { tourDetail }
  },
  component: TourEditPage,
  pendingComponent: TourEditSkeleton,
  notFoundComponent: TourNotFound,
})
```

### Navigation

```typescript
// From list page
const handleCreateTour = () => {
  createTour.mutate(locale)
}

// From tour edit to create stop, then navigate
const handleCreateStop = async () => {
  const stopId = await addStop()
  if (!stopId) return

  router.navigate({
    to: '/tours/$nanoId/stops/$stopId/edit',
    params: { nanoId: tourNanoId, stopId },
  })
}
```

## Edge Cases

### Refresh during creation
If the user refreshes while the mutation is in flight, the current page reloads and the in-flight request may be retried by the user. This is a simpler and more explicit failure mode than hidden loader-based writes.

### Idempotent Creation (Optional)
For extra safety, make server creation idempotent with an idempotency key:
```typescript
// Store key in sessionStorage, pass to server
const idempotencyKey = sessionStorage.getItem('create-tour-key') ?? crypto.randomUUID()
sessionStorage.setItem('create-tour-key', idempotencyKey)
await createTourFn({ data: { locale, idempotencyKey } })
```

## Current Status In This Codebase

- The dedicated Studio `/tours/new` and `/tours/:tourId/stops/new` routes were removed.
- Tour creation now starts from the tours list mutation flow.
- Stop creation now starts from the tour editor mutation flow.
