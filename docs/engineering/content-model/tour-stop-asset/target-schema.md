---
title: "Schema Redesign: Target Schema Definitions"
---

**Status:** Reference Document  
**Date:** February 2026  
**Based On:** [decisions-locked.md](./decisions-locked.md), [architecture.md](./architecture.md)

This document contains exact Drizzle ORM schema definitions for all tables in the simplified 15-table architecture.

**Key Simplification (Feb 2026):** Locale text now uses staging-only pattern (draft → live) instead of full versioning. This removes 2 version tables and simplifies the publish logic. Versioning can be added later if rollback is needed.

---

## Table of Contents

1. [Common Imports](#common-imports)
2. [Base Entities](#base-entities)
   - [guide](#guide)
   - [stop](#stop)
   - [asset](#asset)
3. [Locale Text (Staging Only)](#locale-text-staging-only)
   - [guide_locale_draft](#guide_locale_draft)
   - [guide_locale](#guide_locale)
   - [stop_locale_draft](#stop_locale_draft)
   - [stop_locale](#stop_locale)
4. [Settings (Staging Only)](#settings-staging-only)
   - [guide_settings_draft](#guide_settings_draft)
   - [guide_settings](#guide_settings)
   - [stop_settings_draft](#stop_settings_draft)
   - [stop_settings](#stop_settings)
5. [Structure (Staging Only)](#structure-staging-only)
   - [guide_stop_draft](#guide_stop_draft)
   - [guide_stop](#guide_stop)
6. [Assets (Staging Only)](#assets-staging-only)
   - [guide_asset_draft](#guide_asset_draft)
   - [guide_asset](#guide_asset)
   - [stop_asset_draft](#stop_asset_draft)
   - [stop_asset](#stop_asset)
7. [Relations](#relations)
8. [Type Exports](#type-exports)

---

## Common Imports

```typescript
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'
import { organization } from '../orgs/schema'

const studioSchema = pgSchema('studio')
```

---

## Base Entities

### guide

Base entity for guides. Contains identity, ownership, and lifecycle fields only.

**Key changes from current:**
- ❌ Remove `themeId` (moves to `guide_settings_draft`)

```typescript
export const guide = studioSchema.table(
  'tour',
  {
    // Identity
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_guide_nano_id'),

    // Ownership
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Lifecycle
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    // Soft delete
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Convenience (derived from locale rows, but cached here)
    availableLocales: text('available_locales').array().notNull().default(['en']),
  },
  (t) => ({
    guideOrgIdx: index('tour_org_idx').on(t.organizationId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | Internal ID |
| nano_id | varchar(21) | NOT NULL, UNIQUE | - | External ID |
| organization_id | uuid | NOT NULL, FK→organization | - | Owner org |
| created_at | timestamptz | NOT NULL | now() | - |
| created_by | uuid | NOT NULL, FK→auth.users | - | - |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | NOT NULL, FK→auth.users | - | - |
| archived_at | timestamptz | nullable | - | Soft archive |
| deleted_at | timestamptz | nullable | - | Soft delete |
| available_locales | text[] | NOT NULL | ['en'] | Cached locale list |

**Indexes:**
- `guide_org_idx` on (organization_id)

---

### stop

Base entity for stops. Independent entities that can be shared across guides.

```typescript
export const stop = studioSchema.table(
  'stop',
  {
    // Identity
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_stop_nano_id'),

    // Ownership
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Lifecycle
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    // Soft delete
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Convenience
    availableLocales: text('available_locales').array().notNull().default(['en']),
  },
  (t) => ({
    stopOrgIdx: index('stop_org_idx').on(t.organizationId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | Internal ID |
| nano_id | varchar(21) | NOT NULL, UNIQUE | - | External ID |
| organization_id | uuid | NOT NULL, FK→organization | - | Owner org |
| created_at | timestamptz | NOT NULL | now() | - |
| created_by | uuid | NOT NULL, FK→auth.users | - | - |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | NOT NULL, FK→auth.users | - | - |
| archived_at | timestamptz | nullable | - | Soft archive |
| deleted_at | timestamptz | nullable | - | Soft delete |
| available_locales | text[] | NOT NULL | ['en'] | Cached locale list |

**Indexes:**
- `stop_org_idx` on (organization_id)

---

### asset

Immutable file records. Assets have no locale field — localization is on the assignment.

**Key changes from current:**
- ❌ Remove `locale` field (locale is on assignment tables)

```typescript
export const assetType = pgEnum('asset_type', ['image', 'audio', 'video'])

export const asset = studioSchema.table(
  'asset',
  {
    // Identity
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_asset_nano_id'),

    // File metadata
    fileName: varchar('file_name', { length: 500 }).notNull(),
    fileSize: integer('file_size').notNull(),
    mimeType: varchar('mime_type', { length: 100 }).notNull(),
    type: assetType('type').notNull(),

    // Storage
    storagePath: text('storage_path').notNull(),
    publicUrl: text('public_url'),

    // Media metadata (optional)
    width: integer('width'),
    height: integer('height'),
    duration: integer('duration'), // seconds for audio/video

    // Ownership
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    assetOrgIdx: index('asset_org_idx').on(t.organizationId),
    assetTypeOrgIdx: index('asset_type_org_idx').on(t.type, t.organizationId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | Internal ID |
| nano_id | varchar(21) | NOT NULL, UNIQUE | - | External ID |
| file_name | varchar(500) | NOT NULL | - | Original filename |
| file_size | integer | NOT NULL | - | Bytes |
| mime_type | varchar(100) | NOT NULL | - | e.g., image/jpeg |
| type | asset_type enum | NOT NULL | - | image/audio/video |
| storage_path | text | NOT NULL | - | Storage bucket path |
| public_url | text | nullable | - | CDN URL if public |
| width | integer | nullable | - | Images only |
| height | integer | nullable | - | Images only |
| duration | integer | nullable | - | Audio/video seconds |
| organization_id | uuid | NOT NULL, FK→organization | - | Owner org |
| uploaded_by | uuid | NOT NULL, FK→auth.users | - | Uploader |
| created_at | timestamptz | NOT NULL | now() | - |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |

**Indexes:**
- `asset_org_idx` on (organization_id)
- `asset_type_org_idx` on (type, organization_id)

---

## Locale Text (Staging Only)

Locale text uses the same staging pattern as settings/structure/assets: draft table for editing, live table for published content. Publishing copies draft to live.

**Why no versioning?** For MVP, rollback is a power-user feature. If someone publishes a typo, they fix it and republish. Versioning can be added later as an append-only table if needed.

### guide_locale_draft

Mutable working copy of guide locale text. One row per guide+locale combination.

```typescript
export const guideLocaleDraft = studioSchema.table(
  'tour_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    // Content
    title: varchar('title', { length: 500 }),
    description: text('description'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideLocaleDraft: uniqueIndex('uniq_guide_locale_draft').on(t.guideId, t.locale),
    guideIdx: index('tour_locale_draft_guide_idx').on(t.guideId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| locale | varchar(10) | NOT NULL | - | e.g., 'en', 'de' |
| title | varchar(500) | nullable | - | Guide title |
| description | text | nullable | - | Guide description |
| created_at | timestamptz | NOT NULL | now() | - |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | nullable, FK→auth.users | - | Last editor |

**Indexes:**
- `uniq_guide_locale_draft` UNIQUE on (guide_id, locale)
- `guide_locale_draft_guide_idx` on (guide_id)

---

### guide_locale

Live published guide locale text. One row per guide+locale combination. Published from draft.

```typescript
export const guideLocale = studioSchema.table(
  'tour_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    // Content (copied from draft on publish)
    title: varchar('title', { length: 500 }),
    description: text('description'),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideLocale: uniqueIndex('uniq_guide_locale').on(t.guideId, t.locale),
    guideIdx: index('tour_locale_guide_idx').on(t.guideId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| locale | varchar(10) | NOT NULL | - | e.g., 'en', 'de' |
| title | varchar(500) | nullable | - | Published title |
| description | text | nullable | - | Published description |
| published_at | timestamptz | NOT NULL | now() | When published |
| published_by | uuid | nullable, FK→auth.users | - | Publisher |

**Indexes:**
- `uniq_guide_locale` UNIQUE on (guide_id, locale)
- `guide_locale_guide_idx` on (guide_id)

---

### stop_locale_draft

Mutable working copy of stop locale text. One row per stop+locale combination.

```typescript
export const stopLocaleDraft = studioSchema.table(
  'stop_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    // Content
    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopLocaleDraft: uniqueIndex('uniq_stop_locale_draft').on(t.stopId, t.locale),
    stopIdx: index('stop_locale_draft_stop_idx').on(t.stopId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, FK→stop | - | Parent stop |
| locale | varchar(10) | NOT NULL | - | e.g., 'en', 'de' |
| title | varchar(500) | nullable | - | Stop title |
| description | text | nullable | - | Stop description |
| transcription | text | nullable | - | Audio transcription |
| created_at | timestamptz | NOT NULL | now() | - |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | nullable, FK→auth.users | - | Last editor |

**Indexes:**
- `uniq_stop_locale_draft` UNIQUE on (stop_id, locale)
- `stop_locale_draft_stop_idx` on (stop_id)

---

### stop_locale

Live published stop locale text. One row per stop+locale combination. Published from draft.

```typescript
export const stopLocale = studioSchema.table(
  'stop_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    // Content (copied from draft on publish)
    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopLocale: uniqueIndex('uniq_stop_locale').on(t.stopId, t.locale),
    stopIdx: index('stop_locale_stop_idx').on(t.stopId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, FK→stop | - | Parent stop |
| locale | varchar(10) | NOT NULL | - | e.g., 'en', 'de' |
| title | varchar(500) | nullable | - | Published title |
| description | text | nullable | - | Published description |
| transcription | text | nullable | - | Published transcription |
| published_at | timestamptz | NOT NULL | now() | When published |
| published_by | uuid | nullable, FK→auth.users | - | Publisher |

**Indexes:**
- `uniq_stop_locale` UNIQUE on (stop_id, locale)
- `stop_locale_stop_idx` on (stop_id)

---

## Settings (Staging Only)

### guide_settings_draft

Mutable settings for a guide. One per guide.

```typescript
export const guideSettingsDraft = studioSchema.table(
  'tour_settings_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent (1:1)
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    // Settings
    themeId: uuid('theme_id'), // FK to theme table if exists
    settingsJson: text('settings_json'), // JSON string for flexibility

    // Audit
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideSettingsDraft: uniqueIndex('uniq_guide_settings_draft').on(t.guideId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, UNIQUE, FK→guide | - | One per guide |
| theme_id | uuid | nullable | - | Theme reference |
| settings_json | text | nullable | - | JSON for extensibility |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | nullable, FK→auth.users | - | Last editor |

**Indexes:**
- `uniq_guide_settings_draft` UNIQUE on (guide_id)

---

### guide_settings

Live settings for a guide. Published from draft.

```typescript
export const guideSettings = studioSchema.table(
  'tour_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent (1:1)
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    // Settings (same as draft)
    themeId: uuid('theme_id'),
    settingsJson: text('settings_json'),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqGuideSettings: uniqueIndex('uniq_guide_settings').on(t.guideId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, UNIQUE, FK→guide | - | One per guide |
| theme_id | uuid | nullable | - | Theme reference |
| settings_json | text | nullable | - | JSON for extensibility |
| published_at | timestamptz | NOT NULL | now() | When published |
| published_by | uuid | nullable, FK→auth.users | - | Publisher |

**Indexes:**
- `uniq_guide_settings` UNIQUE on (guide_id)

---

### stop_settings_draft

Mutable settings for a stop. One per stop.

```typescript
export const stopSettingsDraft = studioSchema.table(
  'stop_settings_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent (1:1)
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    // Settings
    coordinates: varchar('coordinates', { length: 100 }), // "lat,lng" or JSON
    settingsJson: text('settings_json'),

    // Audit
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopSettingsDraft: uniqueIndex('uniq_stop_settings_draft').on(t.stopId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, UNIQUE, FK→stop | - | One per stop |
| coordinates | varchar(100) | nullable | - | Lat/lng as string |
| settings_json | text | nullable | - | JSON for extensibility |
| updated_at | timestamptz | NOT NULL | now() | Auto-updates |
| updated_by | uuid | nullable, FK→auth.users | - | Last editor |

**Indexes:**
- `uniq_stop_settings_draft` UNIQUE on (stop_id)

---

### stop_settings

Live settings for a stop. Published from draft.

```typescript
export const stopSettings = studioSchema.table(
  'stop_settings',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent (1:1)
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    // Settings (same as draft)
    coordinates: varchar('coordinates', { length: 100 }),
    settingsJson: text('settings_json'),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
    publishedBy: uuid('published_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqStopSettings: uniqueIndex('uniq_stop_settings').on(t.stopId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, UNIQUE, FK→stop | - | One per stop |
| coordinates | varchar(100) | nullable | - | Lat/lng as string |
| settings_json | text | nullable | - | JSON for extensibility |
| published_at | timestamptz | NOT NULL | now() | When published |
| published_by | uuid | nullable, FK→auth.users | - | Publisher |

**Indexes:**
- `uniq_stop_settings` UNIQUE on (stop_id)

---

## Structure (Staging Only)

### guide_stop_draft

Draft stop list for a guide (what editors see).

```typescript
export const guideStopDraft = studioSchema.table(
  'tour_stop_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    // Order & visibility
    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideStopDraft: uniqueIndex('uniq_guide_stop_draft').on(t.guideId, t.stopId),
    guideIdx: index('tour_stop_draft_guide_idx').on(t.guideId),
    stopIdx: index('tour_stop_draft_stop_idx').on(t.stopId),
    positionIdx: index('tour_stop_draft_position_idx').on(t.guideId, t.position),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| stop_id | uuid | NOT NULL, FK→stop | - | Linked stop |
| position | integer | NOT NULL | - | Order in list |
| visible | boolean | NOT NULL | true | Show/hide |
| created_at | timestamptz | NOT NULL | now() | - |

**Indexes:**
- `uniq_guide_stop_draft` UNIQUE on (guide_id, stop_id)
- `guide_stop_draft_guide_idx` on (guide_id)
- `guide_stop_draft_stop_idx` on (stop_id)
- `guide_stop_draft_position_idx` on (guide_id, position)

---

### guide_stop

Live stop list for a guide (what visitors see). Published from draft.

```typescript
export const guideStop = studioSchema.table(
  'tour_stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    // Order & visibility (same as draft)
    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideStop: uniqueIndex('uniq_guide_stop').on(t.guideId, t.stopId),
    guideIdx: index('tour_stop_guide_idx').on(t.guideId),
    stopIdx: index('tour_stop_stop_idx').on(t.stopId),
    positionIdx: index('tour_stop_position_idx').on(t.guideId, t.position),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| stop_id | uuid | NOT NULL, FK→stop | - | Linked stop |
| position | integer | NOT NULL | - | Order in list |
| visible | boolean | NOT NULL | true | Show/hide |
| published_at | timestamptz | NOT NULL | now() | When published |

**Indexes:**
- `uniq_guide_stop` UNIQUE on (guide_id, stop_id)
- `guide_stop_guide_idx` on (guide_id)
- `guide_stop_stop_idx` on (stop_id)
- `guide_stop_position_idx` on (guide_id, position)

---

## Assets (Staging Only)

### guide_asset_draft

Draft asset assignments for a guide.

**Channels:** `images.hero`, `images.gallery`, `audio.background`

```typescript
export const guideAssetDraft = studioSchema.table(
  'tour_asset_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),

    // Assignment context
    channel: varchar('channel', { length: 50 }).notNull(), // e.g., 'images.hero'
    locale: varchar('locale', { length: 10 }), // NULL = global
    position: integer('position').notNull().default(0),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    // One asset per channel+locale+position (or just channel+locale if position should be unique)
    uniqGuideAssetDraft: uniqueIndex('uniq_guide_asset_draft').on(
      t.guideId,
      t.assetId,
      t.channel,
      t.locale,
    ),
    guideIdx: index('tour_asset_draft_guide_idx').on(t.guideId),
    channelIdx: index('tour_asset_draft_channel_idx').on(t.guideId, t.channel),
    assetIdx: index('tour_asset_draft_asset_idx').on(t.assetId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| asset_id | uuid | NOT NULL, FK→asset | - | Linked asset |
| channel | varchar(50) | NOT NULL | - | e.g., 'images.hero' |
| locale | varchar(10) | nullable | - | NULL = global |
| position | integer | NOT NULL | 0 | Order in channel |
| created_at | timestamptz | NOT NULL | now() | - |

**Indexes:**
- `uniq_guide_asset_draft` UNIQUE on (guide_id, asset_id, channel, locale)
- `guide_asset_draft_guide_idx` on (guide_id)
- `guide_asset_draft_channel_idx` on (guide_id, channel)
- `guide_asset_draft_asset_idx` on (asset_id)

---

### guide_asset

Live asset assignments for a guide. Published from draft.

```typescript
export const guideAsset = studioSchema.table(
  'tour_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    guideId: uuid('tour_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),

    // Assignment context (same as draft)
    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideAsset: uniqueIndex('uniq_guide_asset').on(t.guideId, t.assetId, t.channel, t.locale),
    guideIdx: index('tour_asset_guide_idx').on(t.guideId),
    channelIdx: index('tour_asset_channel_idx').on(t.guideId, t.channel),
    assetIdx: index('tour_asset_asset_idx').on(t.assetId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| guide_id | uuid | NOT NULL, FK→guide | - | Parent guide |
| asset_id | uuid | NOT NULL, FK→asset | - | Linked asset |
| channel | varchar(50) | NOT NULL | - | e.g., 'images.hero' |
| locale | varchar(10) | nullable | - | NULL = global |
| position | integer | NOT NULL | 0 | Order in channel |
| published_at | timestamptz | NOT NULL | now() | When published |

**Indexes:**
- `uniq_guide_asset` UNIQUE on (guide_id, asset_id, channel, locale)
- `guide_asset_guide_idx` on (guide_id)
- `guide_asset_channel_idx` on (guide_id, channel)
- `guide_asset_asset_idx` on (asset_id)

---

### stop_asset_draft

Draft asset assignments for a stop.

**Channels:** `images.hero`, `images.gallery`, `audio.narration`, `audio.background`, `video.main`

```typescript
export const stopAssetDraft = studioSchema.table(
  'stop_asset_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),

    // Assignment context
    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqStopAssetDraft: uniqueIndex('uniq_stop_asset_draft').on(
      t.stopId,
      t.assetId,
      t.channel,
      t.locale,
    ),
    stopIdx: index('stop_asset_draft_stop_idx').on(t.stopId),
    channelIdx: index('stop_asset_draft_channel_idx').on(t.stopId, t.channel),
    assetIdx: index('stop_asset_draft_asset_idx').on(t.assetId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, FK→stop | - | Parent stop |
| asset_id | uuid | NOT NULL, FK→asset | - | Linked asset |
| channel | varchar(50) | NOT NULL | - | e.g., 'audio.narration' |
| locale | varchar(10) | nullable | - | NULL = global |
| position | integer | NOT NULL | 0 | Order in channel |
| created_at | timestamptz | NOT NULL | now() | - |

**Indexes:**
- `uniq_stop_asset_draft` UNIQUE on (stop_id, asset_id, channel, locale)
- `stop_asset_draft_stop_idx` on (stop_id)
- `stop_asset_draft_channel_idx` on (stop_id, channel)
- `stop_asset_draft_asset_idx` on (asset_id)

---

### stop_asset

Live asset assignments for a stop. Published from draft.

```typescript
export const stopAsset = studioSchema.table(
  'stop_asset',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // Parent
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => asset.id, { onDelete: 'cascade' }),

    // Assignment context (same as draft)
    channel: varchar('channel', { length: 50 }).notNull(),
    locale: varchar('locale', { length: 10 }),
    position: integer('position').notNull().default(0),

    // Audit
    publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqStopAsset: uniqueIndex('uniq_stop_asset').on(t.stopId, t.assetId, t.channel, t.locale),
    stopIdx: index('stop_asset_stop_idx').on(t.stopId),
    channelIdx: index('stop_asset_channel_idx').on(t.stopId, t.channel),
    assetIdx: index('stop_asset_asset_idx').on(t.assetId),
  }),
)
```

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | defaultRandom() | - |
| stop_id | uuid | NOT NULL, FK→stop | - | Parent stop |
| asset_id | uuid | NOT NULL, FK→asset | - | Linked asset |
| channel | varchar(50) | NOT NULL | - | e.g., 'audio.narration' |
| locale | varchar(10) | nullable | - | NULL = global |
| position | integer | NOT NULL | 0 | Order in channel |
| published_at | timestamptz | NOT NULL | now() | When published |

**Indexes:**
- `uniq_stop_asset` UNIQUE on (stop_id, asset_id, channel, locale)
- `stop_asset_stop_idx` on (stop_id)
- `stop_asset_channel_idx` on (stop_id, channel)
- `stop_asset_asset_idx` on (asset_id)

---

## Relations

```typescript
import { relations } from 'drizzle-orm'

// Guide relations
export const guideRelations = relations(guide, ({ many, one }) => ({
  locales: many(guideLocale),
  settingsDraft: one(guideSettingsDraft, {
    fields: [guide.id],
    references: [guideSettingsDraft.guideId],
  }),
  settings: one(guideSettings, {
    fields: [guide.id],
    references: [guideSettings.guideId],
  }),
  stopsDraft: many(guideStopDraft),
  stops: many(guideStop),
  assetsDraft: many(guideAssetDraft),
  assets: many(guideAsset),
  creator: one(authUsers, {
    fields: [guide.createdBy],
    references: [authUsers.id],
    relationName: 'tour_creator',
  }),
  updater: one(authUsers, {
    fields: [guide.updatedBy],
    references: [authUsers.id],
    relationName: 'tour_updater',
  }),
}))

// Stop relations
export const stopRelations = relations(stop, ({ many, one }) => ({
  locales: many(stopLocale),
  settingsDraft: one(stopSettingsDraft, {
    fields: [stop.id],
    references: [stopSettingsDraft.stopId],
  }),
  settings: one(stopSettings, {
    fields: [stop.id],
    references: [stopSettings.stopId],
  }),
  guideStopsDraft: many(guideStopDraft),
  guideStops: many(guideStop),
  assetsDraft: many(stopAssetDraft),
  assets: many(stopAsset),
  creator: one(authUsers, {
    fields: [stop.createdBy],
    references: [authUsers.id],
    relationName: 'stop_creator',
  }),
  updater: one(authUsers, {
    fields: [stop.updatedBy],
    references: [authUsers.id],
    relationName: 'stop_updater',
  }),
}))

// Guide locale relations (staging pattern)
export const guideLocaleDraftRelations = relations(guideLocaleDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideLocaleDraft.guideId],
    references: [guide.id],
  }),
  updater: one(authUsers, {
    fields: [guideLocaleDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const guideLocaleRelations = relations(guideLocale, ({ one }) => ({
  guide: one(guide, {
    fields: [guideLocale.guideId],
    references: [guide.id],
  }),
  publisher: one(authUsers, {
    fields: [guideLocale.publishedBy],
    references: [authUsers.id],
  }),
}))

// Stop locale relations (staging pattern)
export const stopLocaleDraftRelations = relations(stopLocaleDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopLocaleDraft.stopId],
    references: [stop.id],
  }),
  updater: one(authUsers, {
    fields: [stopLocaleDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const stopLocaleRelations = relations(stopLocale, ({ one }) => ({
  stop: one(stop, {
    fields: [stopLocale.stopId],
    references: [stop.id],
  }),
  publisher: one(authUsers, {
    fields: [stopLocale.publishedBy],
    references: [authUsers.id],
  }),
}))

// Settings relations
export const guideSettingsDraftRelations = relations(guideSettingsDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideSettingsDraft.guideId],
    references: [guide.id],
  }),
  updater: one(authUsers, {
    fields: [guideSettingsDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const guideSettingsRelations = relations(guideSettings, ({ one }) => ({
  guide: one(guide, {
    fields: [guideSettings.guideId],
    references: [guide.id],
  }),
  publisher: one(authUsers, {
    fields: [guideSettings.publishedBy],
    references: [authUsers.id],
  }),
}))

export const stopSettingsDraftRelations = relations(stopSettingsDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopSettingsDraft.stopId],
    references: [stop.id],
  }),
  updater: one(authUsers, {
    fields: [stopSettingsDraft.updatedBy],
    references: [authUsers.id],
  }),
}))

export const stopSettingsRelations = relations(stopSettings, ({ one }) => ({
  stop: one(stop, {
    fields: [stopSettings.stopId],
    references: [stop.id],
  }),
  publisher: one(authUsers, {
    fields: [stopSettings.publishedBy],
    references: [authUsers.id],
  }),
}))

// Structure relations
export const guideStopDraftRelations = relations(guideStopDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideStopDraft.guideId],
    references: [guide.id],
  }),
  stop: one(stop, {
    fields: [guideStopDraft.stopId],
    references: [stop.id],
  }),
}))

export const guideStopRelations = relations(guideStop, ({ one }) => ({
  guide: one(guide, {
    fields: [guideStop.guideId],
    references: [guide.id],
  }),
  stop: one(stop, {
    fields: [guideStop.stopId],
    references: [stop.id],
  }),
}))

// Asset relations
export const assetRelations = relations(asset, ({ one }) => ({
  uploader: one(authUsers, {
    fields: [asset.uploadedBy],
    references: [authUsers.id],
  }),
  org: one(organization, {
    fields: [asset.organizationId],
    references: [organization.id],
  }),
}))

export const guideAssetDraftRelations = relations(guideAssetDraft, ({ one }) => ({
  guide: one(guide, {
    fields: [guideAssetDraft.guideId],
    references: [guide.id],
  }),
  asset: one(asset, {
    fields: [guideAssetDraft.assetId],
    references: [asset.id],
  }),
}))

export const guideAssetRelations = relations(guideAsset, ({ one }) => ({
  guide: one(guide, {
    fields: [guideAsset.guideId],
    references: [guide.id],
  }),
  asset: one(asset, {
    fields: [guideAsset.assetId],
    references: [asset.id],
  }),
}))

export const stopAssetDraftRelations = relations(stopAssetDraft, ({ one }) => ({
  stop: one(stop, {
    fields: [stopAssetDraft.stopId],
    references: [stop.id],
  }),
  asset: one(asset, {
    fields: [stopAssetDraft.assetId],
    references: [asset.id],
  }),
}))

export const stopAssetRelations = relations(stopAsset, ({ one }) => ({
  stop: one(stop, {
    fields: [stopAsset.stopId],
    references: [stop.id],
  }),
  asset: one(asset, {
    fields: [stopAsset.assetId],
    references: [asset.id],
  }),
}))
```

---

## Type Exports

```typescript
// Base entities
export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert
export type Asset = typeof asset.$inferSelect
export type NewAsset = typeof asset.$inferInsert
export type AssetType = (typeof assetType.enumValues)[number]

// Locale text (staging)
export type GuideLocaleDraft = typeof guideLocaleDraft.$inferSelect
export type GuideLocale = typeof guideLocale.$inferSelect
export type StopLocaleDraft = typeof stopLocaleDraft.$inferSelect
export type StopLocale = typeof stopLocale.$inferSelect

// Settings (staging)
export type GuideSettingsDraft = typeof guideSettingsDraft.$inferSelect
export type GuideSettings = typeof guideSettings.$inferSelect
export type StopSettingsDraft = typeof stopSettingsDraft.$inferSelect
export type StopSettings = typeof stopSettings.$inferSelect

// Structure (staging)
export type GuideStopDraft = typeof guideStopDraft.$inferSelect
export type GuideStop = typeof guideStop.$inferSelect

// Assets (staging)
export type GuideAssetDraft = typeof guideAssetDraft.$inferSelect
export type GuideAsset = typeof guideAsset.$inferSelect
export type StopAssetDraft = typeof stopAssetDraft.$inferSelect
export type StopAsset = typeof stopAsset.$inferSelect
```

---

## Summary

| Category | Tables | Pattern |
|----------|--------|---------|
| Base entities | guide, stop, asset | Identity only |
| Locale text | 4 tables (guide/stop × draft/live) | Staging only |
| Settings | 4 tables (guide/stop × draft/live) | Staging only |
| Structure | 2 tables (guide_stop_draft, guide_stop) | Staging only |
| Assets | 4 tables (guide/stop × draft/live) | Staging only |
| **Total** | **17 tables** | |

**Simplification (Feb 2026):** Removed `guide_locale_version` and `stop_locale_version` tables. Locale text now uses the same staging pattern as settings/structure/assets. Versioning can be added later if rollback is needed.

---

## Tables Removed vs Current Schema

| Removed | Replacement |
|---------|-------------|
| `guide.themeId` | `guide_settings_draft.themeId` |
| `guideCore`, `guideCoreDraft`, `guideCoreVersion` | `guideSettingsDraft`, `guideSettings` |
| `stopCore`, `stopCoreDraft`, `stopCoreVersion` | `stopSettingsDraft`, `stopSettings` |
| `guideAssetScope`, `stopAssetScope` | Direct asset assignment tables |
| `assetSetDraft`, `assetSetDraftItem` | `guideAssetDraft`, `stopAssetDraft` |
| `assetSetVersion`, `assetSetVersionItem` | `guideAsset`, `stopAsset` |
| Old `guideStop` (non-staging) | `guideStopDraft` + `guideStop` pair |
