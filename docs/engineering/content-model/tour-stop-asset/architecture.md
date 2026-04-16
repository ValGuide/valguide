---
title: "ValGuide Content Architecture"
---

**Version:** 2.1 (Simplified)  
**Date:** January 2026

This document describes the target architecture for guides, stops, and assets in ValGuide. It covers data models, versioning concepts, publishing flows, and visitor resolution.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Entity Model](#entity-model)
3. [Versioning Model](#versioning-model)
4. [Publishing Flows](#publishing-flows)
5. [Visitor Resolution](#visitor-resolution)
6. [Asset System](#asset-system)
7. [Locale Management](#locale-management)
8. [Concurrency & Locking](#concurrency--locking)
9. [Data Flow Diagrams](#data-flow-diagrams)

---

## Core Concepts

### Design Principles

1. **Drafts are mutable** — Editors always work on a draft
2. **Published content is separate** — What visitors see is isolated from editing
3. **Publish = intentional action** — Nothing goes live by accident
4. **Consistent UX** — Everything has draft/publish (no "is this live?" confusion)
5. **Simplicity over features** — Full versioning only where rollback is valuable
6. **Eager draft creation** — Drafts exist from entity creation

### Versioning Strategy

| Content Type | Strategy | Rollback? |
|--------------|----------|-----------|
| Locale text (title, description) | **Full versioning** | ✅ Yes |
| Structure (stop order/visibility) | **Staging only** | ❌ No |
| Assets (images, audio, video) | **Staging only** | ❌ No |
| Settings (theme, coordinates) | **Staging only** | ❌ No |

**Why this split:**
- **Text** needs rollback (translations are expensive, mistakes happen)
- **Everything else** just needs staging (easy to fix manually if wrong)
- **Consistent UX** — all content types behave the same way

### Terminology

| Term | Definition |
|------|------------|
| **Entity** | Base record (guide, stop, asset) |
| **Locale** | Language-specific content unit (title, description) |
| **Draft** | Mutable working copy (what editors see) |
| **Published/Live** | What visitors see |
| **Version** | Immutable snapshot (only for locale text) |
| **Staging** | Draft → Published copy (no history) |

---

## Entity Model

### Guides

A guide is the primary content container:

```
Guide (base entity)
├── GuideLocale[] (one per language)
│   ├── GuideLocaleDraft (mutable text)
│   └── GuideLocaleVersion[] (immutable history)
├── GuideSettingsDraft (mutable settings)
├── GuideSettings (live settings)
├── GuideStopDraft[] (draft stop list)
├── GuideStop[] (published stop list)
├── GuideAssetDraft[] (draft assets)
└── GuideAsset[] (published assets)
```

**Base Entity Fields:**
- `id` (UUID, internal only)
- `nanoId` (external identifier, 10-char alphanumeric)
- `organizationId` (ownership)
- `availableLocales` (array of enabled locales)
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
- `archivedAt`, `deletedAt` (soft delete)

### Stops

Stops are independent entities that can be shared across multiple guides:

```
Stop (base entity)
├── StopLocale[] (one per language)
│   ├── StopLocaleDraft (mutable text)
│   └── StopLocaleVersion[] (immutable history)
├── StopSettingsDraft (mutable settings)
├── StopSettings (live settings)
├── StopAssetDraft[] (draft assets)
└── StopAsset[] (published assets)
```

Stops are linked to guides via `guide_stop` / `guide_stop_draft` tables.

### Assets

Assets are immutable file records:

```
Asset
├── id, nanoId
├── fileName, fileSize, mimeType, type
├── storagePath, publicUrl
├── width, height, duration (media metadata)
├── organizationId, uploadedBy
└── createdAt, updatedAt
```

Assets have no `locale` field — localization is handled by which assignment they're in.

---

## Versioning Model

### Locale Text: Full Versioning

Locale text uses the identity + draft + version pattern for rollback support:

```
┌─────────────────────────────────────────────────────────┐
│ GuideLocale (identity row)                              │
│                      ┌────────────────────────────────┐ │
│           ◀──────────┤ GuideLocaleDraft               │ │
│  (draft.guideLocaleId│ - title, description           │ │
│   points to locale)  │ - revision (optimistic lock)   │ │
│                      └────────────────────────────────┘ │
│ ┌─────────────────┐  ┌────────────────────────────────┐ │
│ │ publishedId ────┼──┤ GuideLocaleVersion (current)   │ │
│ │ (nullable)      │  │ - immutable snapshot           │ │
│ └─────────────────┘  └────────────────────────────────┘ │
│                              │                          │
│                              ▼                          │
│               ┌───────────────────────────────┐         │
│               │ Version History (v1, v2, v3…) │         │
│               └───────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

**Note:** The draft references the locale via `guideLocaleId` (not the other way around) to avoid circular FK dependencies. The 1:1 relationship is enforced by a UNIQUE constraint on `guide_locale_draft.guide_locale_id`.

### Structure & Assets: Staging Only

Structure and assets use a simpler draft → published copy pattern:

```
┌─────────────────────────────────────────────────────────┐
│ Staging Pattern (no history)                            │
│                                                         │
│ ┌─────────────────────┐     ┌─────────────────────┐     │
│ │ guide_stop_draft    │     │ guide_stop          │     │
│ │ (editors see)       │ ──► │ (visitors see)      │     │
│ │                     │     │                     │     │
│ │ stopId, position,   │     │ stopId, position,   │     │
│ │ visible             │     │ visible             │     │
│ └─────────────────────┘     └─────────────────────┘     │
│                                                         │
│         Publish = DELETE live + INSERT FROM draft       │
└─────────────────────────────────────────────────────────┘
```

**No version history.** If you publish a mistake, you fix it manually and publish again.

---

## Publishing Flows

### Publish Locale Text (with history)

Creates an immutable snapshot:

```
1. BEGIN TRANSACTION
2. Lock guide_locale row FOR UPDATE
3. Read draft content
4. INSERT new guide_locale_version (snapshot)
5. UPDATE guide_locale.publishedVersionId = new version
6. UPDATE guide_locale.lastPublishedDraftRevision
7. COMMIT
```

### Publish Settings (staging copy)

Overwrites live with draft:

```
1. BEGIN TRANSACTION
2. DELETE FROM guide_settings WHERE guideId = ?
3. INSERT INTO guide_settings SELECT * FROM guide_settings_draft WHERE guideId = ?
4. COMMIT
```

### Publish Structure (staging copy)

Same pattern:

```
1. BEGIN TRANSACTION
2. DELETE FROM guide_stop WHERE guideId = ?
3. INSERT INTO guide_stop SELECT * FROM guide_stop_draft WHERE guideId = ?
4. COMMIT
```

### Publish Assets (staging copy)

Same pattern:

```
1. BEGIN TRANSACTION
2. DELETE FROM guide_asset WHERE guideId = ? AND channel = ? AND locale = ?
3. INSERT INTO guide_asset SELECT * FROM guide_asset_draft WHERE ...
4. COMMIT
```

### Unpublish

**Locale text:** Set `publishedVersionId = NULL`

**Settings:** `DELETE FROM guide_settings WHERE guideId = ?`

**Structure:** `DELETE FROM guide_stop WHERE guideId = ?`

**Assets:** `DELETE FROM guide_asset WHERE guideId = ? AND channel = ? AND locale = ?`

### Rollback (Locale Text Only)

Move `publishedVersionId` to an older version. Draft unchanged.

Structure and assets don't support rollback — fix and republish.

---

## Visitor Resolution

### Text Content

```sql
-- Get published guide text for locale
SELECT v.title, v.description
FROM guide_locale gl
JOIN guide_locale_version v ON v.id = gl.publishedVersionId
WHERE gl.guideId = ? AND gl.locale = ?
```

### Structure (Stop List)

```sql
-- Get published stops (from live table, not draft)
SELECT gs.stopId, gs.position, gs.visible
FROM guide_stop gs
WHERE gs.guideId = ? AND gs.visible = true
ORDER BY gs.position
```

### Assets

```sql
-- Get published assets (additive: locale + global)
SELECT a.*, ga.position, ga.channel
FROM guide_asset ga
JOIN asset a ON a.id = ga.assetId
WHERE ga.guideId = ?
  AND ga.channel = ?
  AND (ga.locale = ? OR ga.locale IS NULL)
ORDER BY ga.position
```

---

## Asset System

### Channels

Assets are organized by channel (purpose):

**Guide Channels:**
- `images.hero` - Cover image
- `images.gallery` - Additional images
- `audio.background` - Background music

**Stop Channels:**
- `images.hero` - Main stop image
- `images.gallery` - Additional images
- `audio.narration` - Audio guide
- `audio.background` - Background music
- `video.main` - Main video

### Asset Assignment Tables

```
guide_asset_draft (staging)
├── guideId
├── assetId
├── channel (e.g., "images.hero")
├── locale (NULL = global)
└── position

guide_asset (live - copied from draft on publish)
├── same fields
```

### Locale Resolution (Additive)

For visitor locale `L`, include assets where:
- `locale = L` (localized)
- `locale IS NULL` (global)

Both are included. Global does NOT replace localized.

---

## Locale Management

### Adding a Locale

```
1. Add to entity.availableLocales
2. INSERT guide_locale (identity)
3. INSERT guide_locale_draft (empty text)
```

Does NOT propagate to stops automatically.

### Removing a Locale

- If published: soft-delete (set deletedAt)
- If never published: hard delete OK

---

## Concurrency & Locking

### Optimistic Locking (Locale Drafts)

```typescript
const result = await db
  .update(guideLocaleDraft)
  .set({ ...data, revision: draft.revision + 1 })
  .where(and(
    eq(guideLocaleDraft.id, id),
    eq(guideLocaleDraft.revision, draft.revision)
  ))

if (result.rowCount === 0) {
  throw new ConflictError('Modified by another user')
}
```

### Detecting Unpublished Changes

**Locale text:**
```
hasChanges = draft.revision > locale.lastPublishedDraftRevision
```

**Structure/Assets:**
Compare draft vs live tables (or track a simple `hasUnpublishedChanges` flag).

---

## Data Flow Diagrams

### Guide Creation

```
createGuide(title, locale, userId, orgId)
│
▼
BEGIN TRANSACTION
│
├── INSERT guide (nanoId, orgId, availableLocales, themeId=null)
│
├── INSERT guide_locale (guideId, locale)
├── INSERT guide_locale_draft (guideLocaleId, title)
│
└── (guide_stop_draft starts empty, guide_asset_draft starts empty)

COMMIT
```

### Publishing Flow

```
Editor                    Server                   Database
  │                         │                         │
  │ publishLocale(de)       │                         │
  │────────────────────────►│                         │
  │                         │ BEGIN                   │
  │                         │────────────────────────►│
  │                         │                         │
  │                         │ Lock + Read draft       │
  │                         │────────────────────────►│
  │                         │                         │
  │                         │ INSERT version          │
  │                         │────────────────────────►│
  │                         │                         │
  │                         │ UPDATE pointer          │
  │                         │────────────────────────►│
  │                         │                         │
  │                         │ COMMIT                  │
  │                         │────────────────────────►│
  │                         │                         │
  │ { success, versionId }  │                         │
  │◄────────────────────────│                         │
```

### Visitor Resolution

```
Visitor                   Server                   Database
  │                         │                         │
  │ GET /guide/:id?lang=de  │                         │
  │────────────────────────►│                         │
  │                         │                         │
  │                         │ guide base              │
  │                         │────────────────────────►│
  │                         │◄────────────────────────│
  │                         │                         │
  │                         │ locale version (de)     │
  │                         │────────────────────────►│
  │                         │◄────────────────────────│
  │                         │                         │
  │                         │ guide_stop (live)       │
  │                         │────────────────────────►│
  │                         │◄────────────────────────│
  │                         │                         │
  │                         │ guide_asset (live)      │
  │                         │────────────────────────►│
  │                         │◄────────────────────────│
  │                         │                         │
  │                         │ For each stop: repeat   │
  │                         │                         │
  │ { guide, stops }        │                         │
  │◄────────────────────────│                         │
```

---

## Schema Summary (17 Tables)

### Guide Tables (10)

| Table | Purpose |
|-------|---------|
| `guide` | Base entity |
| `guide_locale` | Locale identity + pointers |
| `guide_locale_draft` | Mutable text (title, description) |
| `guide_locale_version` | Immutable snapshots (history) |
| `guide_settings_draft` | Mutable settings (themeId, settingsJson) |
| `guide_settings` | Live settings |
| `guide_stop_draft` | Draft stop list (editors) |
| `guide_stop` | Live stop list (visitors) |
| `guide_asset_draft` | Draft asset assignments |
| `guide_asset` | Live asset assignments |

### Stop Tables (8)

| Table | Purpose |
|-------|---------|
| `stop` | Base entity |
| `stop_locale` | Locale identity + pointers |
| `stop_locale_draft` | Mutable text (title, description, transcription) |
| `stop_locale_version` | Immutable snapshots (history) |
| `stop_settings_draft` | Mutable settings (coordinates, settingsJson) |
| `stop_settings` | Live settings |
| `stop_asset_draft` | Draft asset assignments |
| `stop_asset` | Live asset assignments |

### Shared Tables (1)

| Table | Purpose |
|-------|---------|
| `asset` | Immutable file records |

---

## API Surface

### Guide Management
- `createGuideFn` - Create guide with locale
- `getGuideDetailFn` - Full guide for editors
- `getGuideForVisitorFn` - Published content only
- `updateGuideFn` - Update base fields (theme, settings)
- `archiveGuideFn` / `recoverGuideFn` / `deleteGuideFn`

### Guide Content
- `updateGuideLocaleDraftFn` - Update text
- `updateGuideSettingsDraftFn` - Update settings (theme, etc.)
- `updateGuideStopsDraftFn` - Update stop list
- `updateGuideAssetsDraftFn` - Update assets

### Guide Publishing
- `publishGuideLocaleFn` / `unpublishGuideLocaleFn` / `rollbackGuideLocaleFn`
- `publishGuideSettingsFn` / `unpublishGuideSettingsFn`
- `publishGuideStructureFn` / `unpublishGuideStructureFn`
- `publishGuideAssetsFn` / `unpublishGuideAssetsFn`

### Stop Management
- `createStopFn` - Create independent stop
- `updateStopLocaleDraftFn` - Update text
- `updateStopSettingsDraftFn` - Update settings (coordinates, etc.)
- `updateStopAssetsDraftFn` - Update assets
- `publishStopLocaleFn` / `unpublishStopLocaleFn` / `rollbackStopLocaleFn`
- `publishStopSettingsFn` / `unpublishStopSettingsFn`
- `publishStopAssetsFn` / `unpublishStopAssetsFn`

### Asset Management
- `getUploadCredentialsFn`
- `confirmAssetUploadFn`
- `deleteAssetFn`

### Locale Management
- `addLocaleToGuideFn` / `removeLocaleFromGuideFn`
- `addLocaleToStopFn` / `removeLocaleFromStopFn`

---

## Curator UX (What They See)

The UI hides versioning complexity:

| UI Element | What It Means |
|------------|---------------|
| **Status: Live** | Published content exists |
| **Status: Draft** | Nothing published yet |
| **"Unpublished changes"** | Draft differs from live |
| **Publish button** | Copy draft → live |
| **Unpublish** | Remove from live |
| **Restore previous** | (Text only) Point to older version |

---

## Mental Model

> **Editors work on drafts. Publishing copies drafts to live. Text has history; structure and assets don't.**
