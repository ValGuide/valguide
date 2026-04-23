---
title: "Slug Architecture"
---

> How ValGuide handles human-readable URLs for organizations and tours.

## The Golden Rule

> **Slugs are technical identifiers, not content.**  
> Localization belongs to display names, not URLs.

Separating these two concepts makes everything simpler.

## Design Principles

### Organization-Scoped, Not Global

ValGuide uses **organization-scoped slugs** for tours rather than globally unique ones.

```
/{locale}/{org-slug}/{tour-slug}
```

Examples:
- `/de/museum-zurich/giacometti`
- `/en/museum-zurich/giacometti`
- `/fr/museum-zurich/giacometti`

Note: Same slugs across all locales. The locale affects the **content language**, not the URL structure.

**Why not global?** ValGuide is B2B/B2G, institution-first. Museums expect their guides to live under their brand, not compete for names globally. A museum shouldn't see "sorry, `highlights` is taken by a museum in Ohio" during setup.

### NOT Localized

Slugs are **stable technical identifiers**, not translated content:

| Entity | Slug | Display Name (varies by locale) |
|--------|------|--------------------------------|
| Organization | `museum-zurich` | EN: "Museum Zurich", DE: "Museum Zurich", FR: "Museum Zurich" |
| Tour | `giacometti` | EN: "Giacometti Exhibition", DE: "Giacometti Ausstellung" |

**Why?** 
- Simpler URLs that work across language switches
- No need to maintain slug translations
- Prevents URL drift when translations change
- Technical identifier ≠ marketing copy

### Immediate, Not Drafted

Slugs are **not part of the draft/publish cycle**. When a curator changes a slug, it takes effect immediately — just like renaming a file. There is no "draft slug" concept.

**Why?** Slugs are technical identifiers, not content. Curators changing a slug want it live now, not "drafted for later." Old slugs are preserved in the redirect table, so nothing breaks.

## Where Slugs Live

### Canonical Slug on the Entity Table

The current slug lives directly on the entity table as a NOT NULL column:

```
organization.slug  →  "museum-zurich"   (globally unique)
tour.slug          →  "giacometti"          (unique per organization)
```

This means:
- Every org and tour **always** has a slug — no null guards needed
- Reading the current slug is a simple column read, no joins or lookups
- The slug is part of the entity's core data, returned with every query

### Redirect Tables for Old Slugs

When a slug changes, the **old** slug is inserted into an append-only redirect log. These tables exist solely for 301 redirects — they are never the source of truth for the current slug.

```
organizationSlug  →  { organizationId, slug: "old-name", createdAt }
tourSlug          →  { tourId, organizationId, slug: "old-name", createdAt }
```

Old slugs are **never reused**. The redirect table implicitly reserves them forever, preventing broken links from printed QR codes, shared URLs, and search engine indexes.

## URL Structure

### Public App
```
# Organization page
valguide.com/{locale}/{org-slug}

# Tour page  
valguide.com/{locale}/{org-slug}/{tour-slug}

# Stop page (uses nanoId, not slug)
valguide.com/{locale}/{org-slug}/{tour-slug}/{stop-nanoId}
```

### Studio (stable nanoIds)
```
studio.valguide.com/tours/{nanoId}
studio.valguide.com/tours/{nanoId}/stops/{stopNanoId}
```

Studio uses nanoIds because slugs can change; internal references should be stable.

## Uniqueness Rules

| Entity | Scope | Constraint |
|--------|-------|------------|
| Organization slug | Globally unique | `unique('unique_org_slug')` on `organization.slug` |
| Tour slug | Per organization | `uniqueIndex` on `(tour.organizationId, tour.slug)` |
| Old org slugs | Globally unique | `uniqueIndex` on `organizationSlug.slug` |
| Old tour slugs | Per organization | `uniqueIndex` on `(tourSlug.organizationId, tourSlug.slug)` |

Slugs are not locale-specific, so uniqueness is straightforward.

## Schema

### Organization Table (canonical slug)

```typescript
export const organization = studioSchema.table('organization', {
  id: uuid('id').defaultRandom().primaryKey(),
  nanoId: varchar('nano_id', { length: 21 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique('unique_org_slug'),
  // ...
})
```

### Tour Table (canonical slug)

```typescript
export const tour = studioSchema.table(
  'tour',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique(),
    organizationId: uuid('organization_id').notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 200 }).notNull(),
    // ...
  },
  (t) => ({
    tourOrgSlugIdx: uniqueIndex('tour_org_slug_unique')
      .on(t.organizationId, t.slug),
  }),
)
```

### Organization Slug Redirect Table (old slugs only)

```typescript
export const organizationSlug = studioSchema.table(
  'organization_slug',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqueSlug: uniqueIndex('organization_slug_unique').on(t.slug),
  }),
)
```

### Tour Slug Redirect Table (old slugs only)

```typescript
export const tourSlug = studioSchema.table(
  'tour_slug',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tourId: uuid('tour_id').notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id').notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 200 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueOrgSlug: uniqueIndex('tour_slug_org_unique')
      .on(t.organizationId, t.slug),
  }),
)
```

## Lifecycle

### Creation

When an org or tour is created, a slug is auto-generated from the name/title and set directly on the entity table. **Nothing is inserted into the redirect table** — there is no old slug to redirect from.

```typescript
// createTeam() — sets organization.slug directly
const slug = await generateUniqueOrgSlug(dbClient, name)

const [newTeam] = await tx.insert(organization).values({
  nanoId: valguideId(),
  name,
  slug,  // ← canonical slug, directly on entity
}).returning()
```

### Slug Change

When a slug is updated, the old slug is saved to the redirect table and the entity is updated — all within a transaction:

```typescript
await db.transaction(async (tx) => {
  // 1. Read current slug
  const [current] = await tx
    .select({ slug: organization.slug })
    .from(organization)
    .where(eq(organization.id, organizationId))

  // 2. Insert old slug into redirect table
  if (current && current.slug !== newSlug) {
    await tx.insert(organizationSlug).values({
      organizationId,
      slug: current.slug,
    })
  }

  // 3. Update canonical slug
  await tx.update(organization)
    .set({ slug: newSlug })
    .where(eq(organization.id, organizationId))
})
```

The same pattern applies to tour slugs via `updateTourSlug()`.

### Resolution (Public App)

Resolution follows a two-step fallback:

1. **Check entity table** — `organization.slug` or `tour.slug` matches → canonical, no redirect
2. **Check redirect table** — `organizationSlug.slug` or `tourSlug.slug` matches → 301 redirect to canonical

```typescript
// resolve-org.server.ts
const org = await db.query.organization.findFirst({
  where: or(
    eq(organization.nanoId, idOrSlug),
    eq(organization.slug, idOrSlug),
  ),
})

if (org) return { found: true, needsRedirect: false, ... }

// Fall back to redirect table
const redirect = await db.query.organizationSlug.findFirst({
  where: eq(organizationSlug.slug, idOrSlug),
})

if (redirect) return { found: true, needsRedirect: true, ... }
```

## Availability Checks

Before saving a slug, availability is checked against three sources:

1. **Reserved list** — system routes like `admin`, `api`, `login`, etc.
2. **NanoId collision** — prevents a slug from matching an existing entity's nanoId
3. **Canonical slug** — checks `organization.slug` or `tour.slug`
4. **Redirect table** — old slugs are never reused

If the slug belongs to the entity being edited (`excludeOrgId` / `excludeTourId`), it returns `takenBy: 'self'` (not a conflict).

### Race Condition Handling

Two users might try to claim the same slug simultaneously. We use two-layer validation:

1. **Pre-save check** — Fast UI feedback via `checkOrgSlugAvailable` / `checkTourSlugAvailable`
2. **Unique constraint exception** — Catch `23505` error on save, return friendly message

### Error Messages

Since slugs are scoped per organization, error messages reflect this:

| Entity | Error Message |
|--------|---------------|
| Organization slug | "This slug is already taken by another organization" |
| Tour slug | "You already used this slug for another tour" |

## Slug Generation

Custom implementation using native JavaScript APIs (no dependencies). Inspired by [@sindresorhus/transliterate](https://github.com/sindresorhus/transliterate).

```typescript
const GERMAN_MAP: Record<string, string> = {
  'ä': 'ae', 'Ä': 'Ae', 'ö': 'oe', 'Ö': 'Oe',
  'ü': 'ue', 'Ü': 'Ue', 'ß': 'ss', 'ẞ': 'Ss',
}

export function generateSlug(text: string): string {
  let result = text.normalize()

  // German replacements (before NFD strips them)
  for (const [char, replacement] of Object.entries(GERMAN_MAP)) {
    result = result.replaceAll(char, replacement)
  }

  return result
    .normalize('NFD').replaceAll(/\p{Diacritic}/gu, '')  // Strip accents
    .replaceAll(/\p{Dash_Punctuation}/gu, '-')           // Normalize dashes
    .replaceAll(/([a-zA-Z\d])['\u2019]([ts])\b/g, '$1$2') // Contractions
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')  // Non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')         // Trim hyphens
}

// "Museum Zurich"   → "museum-zurich"
// "Highlights-Führung" → "highlights-fuehrung"
// "Musée d'Orsay"      → "musee-dorsay"
// "En–dash em—dash"    → "en-dash-em-dash"
```

### Auto-Deduplication

When creating an org or tour, `generateUniqueOrgSlug()` / `generateUniqueTourSlug()` appends `-2`, `-3`, etc. if the slug is already taken.

## Validation

### Format Rules
- 3–100 characters
- Lowercase alphanumeric with hyphens
- No leading/trailing hyphens
- No consecutive hyphens

### Reserved Slugs
```typescript
const RESERVED_SLUGS = [
  'admin', 'api', 'app', 'auth', 'login', 'logout', 'signup',
  'settings', 'help', 'support', 'about', 'contact', 'terms',
  'privacy', 'tours', 'stops', 'assets', 'new', 'edit', 'delete',
  'studio', 'links', 'explore', 'search', 'dashboard', 'profile',
  'account', 'billing', 'invite', 'join', 'team', 'teams',
  'org', 'orgs', 'organization', 'organizations',
]
```

## Language Switching

Since slugs are not localized, language switching is simple:

```
/en/museum-zurich/giacometti  →  /de/museum-zurich/giacometti
```

Just change the locale segment. The slug stays the same, only the content language changes.

## Why Not Swiss incumbent's Model?

Swiss incumbent used globally unique slugs (`/tours/:slug`) because it behaved like a consumer network with public sharing and virality.

**ValGuide is different:**
- B2B/B2G, institution-first
- Brand-sensitive museums
- QR-based, context-aware consumption
- Visitors scan a QR *inside* the museum—they don't care if Paris also has a "giacometti" tour

Global uniqueness adds friction at activation time (worst moment) with near-zero discovery benefit for physical-space audio guides.

## Key Files

| File | Purpose |
|------|---------|
| `packages/core/features/orgs/schema.ts` | `organization.slug` + `organizationSlug` redirect table |
| `packages/core/features/tours/schema.ts` | `tour.slug` + `tourSlug` redirect table |
| `packages/core/utils/slug.ts` | `generateSlug()`, `slugSchema`, `RESERVED_SLUGS` |
| `packages/core/features/orgs/create-team.server.ts` | Sets `organization.slug` at creation |
| `packages/core/features/orgs/update-org-slug.server.ts` | Updates org slug + inserts old into redirect |
| `packages/core/features/tours/tour/slug/update-tour-slug.server.ts` | Updates tour slug + inserts old into redirect |
| `packages/core/features/orgs/check-org-slug-available.server.ts` | Availability check (entity + redirect + reserved) |
| `packages/core/features/tours/tour/slug/check-tour-slug-available.server.ts` | Availability check (entity + redirect + reserved) |
| `packages/core/features/orgs/resolve-org.server.ts` | Public app resolution with redirect fallback |
| `packages/core/features/tours/tour/slug/resolve-tour.server.ts` | Public app resolution with redirect fallback |
| `packages/core/features/links/paths.ts` | Short link → slug URL resolution |

## Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Canonical slug storage | On entity table (`organization.slug`, `tour.slug`) | Always present, no joins needed |
| Slug scope | Per-org (tours), global (orgs) | Institution-first, no naming conflicts |
| Localization | No | Slugs are identifiers, not content |
| Draft/publish for slugs | No — immediate | Technical identifiers don't need review |
| Old slugs | Append-only redirect table, never reused | Prevent broken links from printed QR codes |
| Stop slugs | No (use nanoId) | Simplicity; can add later |
| Redirect tables | Old slugs only, not source of truth | Entity table is the single source of truth |
