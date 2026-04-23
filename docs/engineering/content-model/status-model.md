---
title: "ValGuide Status Model — Current Implementation Reference"
---

## Purpose

This document describes **how the status model currently works** in the codebase. It serves as both a reference and a basis for identifying improvements.

---

## Core Principle

> **You are always editing a working version (draft).
> Only published content is visible to visitors.**

---

## Database Schema (Source of Truth)

All tables live in the `studio` Postgres schema. The staging-only pattern means every aspect has a draft table and a published (live) table. Publishing = upsert from draft to live.

### Tour Table (`studio.tour`)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Internal PK (never exposed) |
| `nanoId` | varchar(21) | External identifier |
| `organizationId` | uuid | FK to org |
| `publishedAt` | timestamp (nullable) | **Single source of truth for guide visibility** |
| `archivedAt` | timestamp (nullable) | Soft-delete flag (overrides publishedAt) |
| `deletedAt` | timestamp (nullable) | Hard-delete marker (filtered in all queries) |
| `availableLocales` | text[] | Array of enabled locales (default: `['en']`) |
| `createdAt`, `updatedAt` | timestamp | Audit timestamps |
| `createdBy`, `updatedBy` | uuid | User references |

**Status derivation:**
- `archivedAt IS NOT NULL` → **Archived**
- `publishedAt IS NULL` → **Unpublished**
- `publishedAt IS NOT NULL` → **Published**

### Stop Table (`studio.stop`)

| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Internal PK |
| `nanoId` | varchar(21) | External identifier |
| `organizationId` | uuid | FK to org |
| `archivedAt` | timestamp (nullable) | Soft-delete flag |
| `deletedAt` | timestamp (nullable) | Hard-delete marker |
| `availableLocales` | text[] | Array of enabled locales |

**Note:** Stops do **not** have their own `publishedAt`. Stop publishing is determined by the presence of rows in the live tables (`stopLocale`, `tourStop`).

### Draft / Live Table Pairs

| Aspect | Draft Table | Live Table | Scope |
|--------|-------------|------------|-------|
| Tour locale text | `tour_locale_draft` | `tour_locale` | Per tour × locale |
| Stop locale text | `stop_locale_draft` | `stop_locale` | Per stop × locale |
| Tour settings | `tour_settings_draft` | `tour_settings` | Per tour |
| Stop settings | `stop_settings_draft` | `stop_settings` | Per stop |
| Tour structure | `tour_stop_draft` | `tour_stop` | Per tour × stop (position + visible) |
| Tour assets | `tour_asset_draft` | `tour_asset` | Per tour × asset × channel |
| Stop assets | `stop_asset_draft` | `stop_asset` | Per stop × asset × channel |

Every live table has a `publishedAt` (non-nullable timestamp) and `publishedBy` (nullable user ref). These serve as audit timestamps for when each row was last published.

### Stop Visibility

Stop visibility is a boolean on the **structure** tables:

- `tour_stop_draft.visible` — controls whether the stop is shown to visitors
- `tour_stop.visible` — the published version of this flag

Visibility is a draft-level concept: toggling hide/show in the UI updates `tour_stop_draft.visible` immediately. The change only reaches visitors after publishing.

---

## Status Utility Functions

**File:** `packages/core/features/tours/status-utils.ts`

### Types

```typescript
type TourStatus = 'published' | 'unpublished' | 'archived'
type ChangeIndicator = 'up-to-date' | 'changed'
type TourStatusInput = { publishedAt: Date | null; archivedAt: Date | null }
type TranslationInput = { hasPublished: boolean }

type TourStatusDisplay = {
  status: TourStatus
  indicator: ChangeIndicator | null  // null when not published
}

type StopTranslationStatus = 'published' | 'unpublished' | 'archived'
type StopTranslationStatusDisplay = {
  status: StopTranslationStatus
  indicator: ChangeIndicator | null
}
```

### `getTourStatus(tour: TourStatusInput): TourStatus`

Returns the guide-level lifecycle state:
1. If `archivedAt !== null` → `'archived'`
2. If `publishedAt === null` → `'unpublished'`
3. Otherwise → `'published'`

### `getTourStatusDisplay(tour: TourStatusInput, hasChanges?: boolean): TourStatusDisplay`

Calls `getTourStatus()` for the primary status, then computes the indicator:
- If status is `'published'`: indicator = `hasChanges ? 'changed' : 'up-to-date'`
- Otherwise: indicator = `null`

### `getStopTranslationStatusDisplay(translation: TranslationInput, archivedAt: Date | null): StopTranslationStatusDisplay`

Used by the stop edit page:
1. If `archivedAt !== null` → status `'archived'`, indicator `null`
2. If `translation.hasPublished` → status `'published'`, indicator `'up-to-date'`
3. Otherwise → status `'unpublished'`, indicator `null`

**Known gap:** This function always returns `'up-to-date'` for published stop translations. It does not accept a `hasChanges` parameter, so it never shows `'changed'`.

---

## Change Detection

### Guide-Level Change Detection

**File:** `packages/core/features/tours/tour/get-tour-has-any-changes.server.ts`

The `getTourHasAnyChanges(tourId)` function runs a single SQL query with `EXISTS` + `EXCEPT` checks across the currently tracked draft/live table pairs. Returns `true` if ANY of these differ:

1. **Tour settings** — `tour_settings_draft` vs `tour_settings` (themeId, settingsJson)
2. **Tour structure** — `tour_stop_draft` vs `tour_stop` (stopId, position, visible)
3. **Tour assets** — `tour_asset_draft` vs `tour_asset` (assetId, channel, locale, position)
4. **Stop locale text** — `stop_locale_draft` vs `stop_locale` for all stops in the tour (title, description, transcription)

This is called by `getTourDetail()` and returned as `hasAnyChanges: boolean`. Only runs when `tour.publishedAt !== null` (unpublished tours skip the query).

**⚠️ Schema migration risk:** This function uses raw SQL (not Drizzle's type-safe query builder). If any of the referenced tables or columns are renamed or removed, the raw SQL must be updated manually to match the schema.

### Per-Locale Text Change Detection

**File:** `packages/core/features/tours/tour/get-tour-detail.server.ts`

The `getTourDetail()` function also computes `hasChanges` per locale by comparing draft vs published title and description:

```
hasPublished = tour.publishedAt !== null AND tourLocale row exists
hasChanges = hasPublished
  ? (draft.title ?? '') !== (published.title ?? '')
    || (draft.description ?? '') !== (published.description ?? '')
  : false
```

This is returned as part of `LocaleDraftInfo` and used by the translations manager to show which locales have text changes.

### Client-Side (Tour Edit Page)

**File:** `apps/studio/src/features/editor/hooks/use-diff-view.ts`

The edit page uses a `useDiffView` hook that fetches diff data via a React Query query (backed by `compareTourLocaleDiff` server function). This returns:
- `hasChanges: boolean`
- `changedFields: string[]`
- `fieldDiffs: FieldDiff[]` (per-field draft vs published comparison)
- `publishedAt: Date | null`

The edit page feeds `changedCount > 0` into `getTourStatusDisplay()` for the indicator.

**File:** `packages/core/features/tours/tour/locale/compare-tour-locale-diff.server.ts`

Compares draft vs published for a single tour locale:
- If no draft exists → returns `null`
- If no published version exists → returns `hasChanges: false` (nothing to compare against)
- Otherwise → field-by-field comparison of title and description (normalizes empty strings to null)

### Client-Side (Stop Edit Page)

The stop edit page also uses `useDiffView` for field-level diff, but `getStopTranslationStatusDisplay()` does not consume the `changedCount`. The status badge always shows `'up-to-date'` for published stop translations.

---

## Publishing Operations

### Publish Tour

**File:** `packages/core/features/tours/tour/publish-tour.server.ts`

`publishTour({ nanoId, locale }, userId)` — atomic transaction that publishes:

1. **Tour locale** (active language): upsert from `tour_locale_draft` → `tour_locale`
2. **Tour structure**: delete all `tour_stop` rows, re-insert from `tour_stop_draft` (includes position and visible)
3. **Tour settings**: upsert from `tour_settings_draft` → `tour_settings`
4. **Tour assets**: delete all `tour_asset` rows, re-insert from `tour_asset_draft`
5. **All stop locales** in the active language: for each stop in the structure, upsert `stop_locale_draft` → `stop_locale`
6. **All stop assets** for all stops in the structure: delete all `stop_asset` rows for each stop, re-insert from `stop_asset_draft`
7. **Sets `tour.publishedAt = now()`**

**What is NOT published:** Stop settings. They have their own separate publish function and are not called from the main publish transaction.

### Unpublish Tour Locale

**File:** `packages/core/features/tours/tour/locale/unpublish-tour-locale.server.ts`

`unpublishTourLocale(tourNanoId, locale)`:
1. Deletes the `tour_locale` row for this locale
2. Checks if any `tour_locale` rows remain
3. If none remain → sets `tour.publishedAt = null` (guide becomes unpublished)

**Note:** Does not delete stop locale rows, tour structure, tour settings, or tour assets. Only removes the tour-level locale text.

### Publish Stop Locale (Standalone)

**File:** `packages/core/features/tours/stop/locale/publish-stop-locale.server.ts`

`publishStopLocale(stopNanoId, locale, userId)`:
- Upserts from `stop_locale_draft` → `stop_locale` for a single stop × locale
- Does not touch the tour's `publishedAt`

### Unpublish Stop Locale

**File:** `packages/core/features/tours/stop/locale/unpublish-stop-locale.server.ts`

`unpublishStopLocale(stopNanoId, locale)`:
- Deletes the `stop_locale` row for this stop × locale
- Does not check remaining locales or update any parent status

### Discard All Tour Changes

**File:** `packages/core/features/tours/tour/discard-all-tour-changes.server.ts`

`discardAllTourChanges(tourNanoId, locale)` — atomic transaction that reverts the tracked tour draft tables and active stop locale drafts to match their published counterparts:

1. **Tour locale** (active language): overwrites `tour_locale_draft` title/description from `tour_locale`
2. **Tour settings**: overwrites `tour_settings_draft` from `tour_settings` (themeId, settingsJson)
3. **Tour structure**: deletes all `tour_stop_draft` rows, re-inserts from `tour_stop` (stopId, position, visible)
4. **Tour assets**: deletes all `tour_asset_draft` rows, re-inserts from `tour_asset` (assetId, channel, locale, position)
5. **All stop locales** in the active language: for each stop in the published structure, overwrites `stop_locale_draft` from `stop_locale` (title, description, transcription)

Requires `tour.publishedAt` to be non-null (throws if the tour has never been published).

**Legacy:** The old `discardTourLocaleDraft()` in `tour/locale/` only reverted title and description. It is no longer used by the editor.

### Discard All Stop Changes

**File:** `packages/core/features/tours/stop/discard-all-stop-changes.server.ts`

`discardAllStopChanges(stopNanoId, locale)` — atomic transaction that reverts ALL stop draft tables to match their published counterparts:

1. **Stop locale** (active language): overwrites `stop_locale_draft` title/description/transcription from `stop_locale`
2. **Stop settings**: overwrites `stop_settings_draft` from `stop_settings` (coordinates, settingsJson)
3. **Stop assets**: deletes all `stop_asset_draft` rows, re-inserts from `stop_asset` (assetId, channel, locale, position)

Requires at least one published locale row to exist for the stop (throws if the stop has never been published).

The confirmation dialog shows stop-specific text: "This will revert text, settings, and media to the last published version." (no mention of "stop order" since that is a tour-level concern).

### Archive Tour

**File:** `packages/core/features/tours/tour/archive-tour.server.ts`

`archiveTour(nanoId, userId)`:
- Sets `archivedAt = now()` on the tour
- Does not touch `publishedAt`, locale rows, structure, or assets
- Authorization: requires tour access by nanoId

### Recover (Restore) Tour

**File:** `packages/core/features/tours/tour/recover-tour.server.ts`

`recoverTour(nanoId, userId)`:
- Sets `archivedAt = null` AND `publishedAt = null`
- Tour is restored to **Unpublished** state (never auto-publishes)
- Published locale/structure/settings/asset rows remain in the live tables but are not visible because `tour.publishedAt` is null

### Archive Stop

**File:** `packages/core/features/tours/stop/archive-stop.server.ts`

`archiveStop(stopId, userId)`:
- Sets `archivedAt = now()` on the stop entity
- Does not remove the stop from `tour_stop_draft` or `tour_stop` structure tables

### Update Stop Visibility (Hide/Show)

**File:** `packages/core/features/tours/structure/update-stop-visibility.server.ts`

`updateStopVisibility({ tourNanoId, stopNanoId, visible })`:
- Updates `tour_stop_draft.visible` for the given tour × stop
- Only affects the draft structure — change becomes visitor-visible after publishing

---

## UI Status Display

### Tour List (Preview Cards)

**File:** `packages/core/features/tours/preview-card.tsx`

Uses `getTourStatus({ publishedAt: tour.published, archivedAt: null })`.

**Known gap:** The preview card's `Tour` type uses `published: z.date().nullable().optional()` instead of `publishedAt`. The card also passes `archivedAt: null` hardcoded — archived tours are filtered out of the list by default, so this works, but the archived state can never be shown on a preview card.

The `StatusBadge` component maps `unpublished` → `'draft'` variant styling (line 120: `tourStatus === 'unpublished' ? 'draft' : tourStatus`). This is a presentation mapping, not a vocabulary issue.

### Tour Detail Page

**File:** `apps/studio/src/features/tours/components/tour-detail-view.tsx`

Computes status with `getTourStatusDisplay()`:
- Status from `tour.publishedAt` and `tour.archivedAt`
- Indicator from `bestLocale.hasChanges` (server-computed per-locale change detection)

Shows `TourStatusBadge` in two places:
1. Title row (sticky header)
2. Metadata grid (details card)

### Tour Edit Page

**File:** `apps/studio/src/features/tours/components/tour-edit-page.tsx`

Computes status with `getTourStatusDisplay()`:
- Status from `tourDetail.publishedAt` and `tourDetail.archivedAt`
- Indicator from `changedCount > 0` (from `useDiffView` client-side diff)

Uses a `stableStatusRef` to prevent the badge from flickering during publish operations.

Passes status to `BaseEditLayout`, which renders:
- `TourStatusBadge` in the header (mobile and desktop)
- Helper text when status is `published` + indicator is `changed`

### Stop Edit Page

**File:** `apps/studio/src/features/stops/components/stop-edit-page.tsx`

Uses `getStopTranslationStatusDisplay()`:
- `hasPublished` from `localeDraft.hasPublished`
- `archivedAt` is always passed as `null`

**Known gap:** Always shows `'up-to-date'` for published stops — never `'changed'` because the function doesn't accept `hasChanges`.

When editing a stop in tour context (`isInTourContext`), publishing is disabled with message "Publish from tour". The stop is published atomically as part of the tour publish operation.

### Translations Manager (Detail Page)

**File:** `apps/studio/src/features/tours/components/translations-manager.tsx`

Shows per-locale badges using `LocaleDraftInfo`:
- `hasPublished && !hasChanges` → "Published" (default badge variant)
- `hasPublished && hasChanges` → "Changed" (outline badge variant)
- `!hasPublished` → "Unpublished" (secondary badge variant)

Actions per locale: Edit (link to edit page), Publish (upload icon), Remove language.

### TourStatusBadge Component

**File:** `apps/studio/src/features/tours/components/tour-status-badge.tsx`

Two-part badge group separating visibility from draft-change info:

1. **Primary pill (visibility)**: small colored dot + label from i18n `tours.visibility.*`
   - Published → "Published" (success colors)
   - Unpublished → "Not published" (outline)
   - Archived → "Archived" (muted)
2. **Secondary pill (optional)**: "Unpublished edits" from i18n `tours.edits.unpublishedEdits`
   - Only shown when `status === 'published'` AND `indicator === 'changed'`
   - "Up to date" is no longer displayed — absence of the secondary pill implies no pending changes

Supports `sm`, `md`, `lg` size variants via CVA. Accessible: dot is decorative (`aria-hidden`), meaning conveyed by text.

### BaseEditLayout

**File:** `apps/studio/src/features/editor/components/base-edit-layout.tsx`

Shared layout for tour and stop editors. Receives `StatusDisplay` and renders:
- `TourStatusBadge` in mobile and desktop headers
- Helper text when `published + changed`: "Visitors are seeing the last published version..."
- `EditorActionsPanel` (desktop sidebar) with Publish, Save, Unpublish, Discard
- `MobileSavePublish` / `MobileMoreMenu` for mobile

### EditorActionsPanel

**File:** `apps/studio/src/features/editor/components/editor-actions-panel.tsx`

Action availability:
- **Publish**: enabled when `hasDraft || isDirty` (can always publish)
- **Unpublish**: enabled when `hasPublished`
- **Discard**: enabled when `hasDraft && hasPublished` (need a published version to revert to)
- **Publishing disabled**: when `publishingDisabled` prop is true (used for stops in tour context)

---

## Data Flow Diagrams

### Tour Status Computation

```
tour.publishedAt  ──────► getTourStatus()  ──────► TourStatusBadge
tour.archivedAt   ──────┘                           ├─ status: published|unpublished|archived
                                                    └─ indicator: changed|up-to-date|null
hasAnyChanges ──────────► getTourStatusDisplay() ──┘

hasAnyChanges source: getTourHasAnyChanges() — compares:
  tour settings (theme), tour structure (stop order/visibility), tour assets, stop locale text

Per-locale hasChanges (translations manager only): draft vs published title/description
```

### Stop Status Computation

```
localeDraft.hasPublished ───► getStopTranslationStatusDisplay() ───► BaseEditLayout
archivedAt (always null) ───┘                                        └─ TourStatusBadge
                                                                        (indicator always up-to-date)
```

### Publish Transaction

```
publishTour(nanoId, locale, userId)
  └─ transaction:
      ├─ tour_locale_draft → tour_locale (active locale)
      ├─ tour_stop_draft → tour_stop (all stops: delete + re-insert)
      ├─ tour_settings_draft → tour_settings
      ├─ tour_asset_draft → tour_asset (delete + re-insert)
      ├─ stop_locale_draft → stop_locale (per stop, active locale)
      ├─ stop_asset_draft → stop_asset (per stop, all draft stop assets)
      └─ tour.publishedAt = now()
```

---

## I18n Keys

| Key | Usage |
|-----|-------|
| `tours.visibility.live` | Tour badge: visibility label (published) |
| `tours.visibility.notLive` | Tour badge: visibility label (unpublished) |
| `tours.visibility.archived` | Tour badge: visibility label (archived) |
| `tours.edits.unpublishedEdits` | Tour badge: secondary pill (draft changes pending) |
| `tours.status.published` | Translations manager per-locale badge |
| `tours.status.unpublished` | Translations manager per-locale badge |
| `tours.status.archived` | Translations manager per-locale badge |
| `tours.indicator.changed` | Translations manager per-locale badge |
| `tours.indicator.up-to-date` | (Legacy, no longer displayed in tour badge) |
| `tours.helper.changedExplanation` | Helper text in edit page |
| `tours.actions.publish` | Publish button |
| `tours.actions.publishing` | Publish button (loading) |
| `tours.actions.unpublish` | Unpublish menu item |
| `tours.actions.save` | Save button |
| `tours.actions.saving` | Save button (loading) |
| `tours.actions.discardChanges` | Discard menu item |
| `tour.previewCard.published` | Preview card badge |
| `tour.previewCard.unpublished` | Preview card badge |

---

## Known Gaps & Inconsistencies

These are areas where the current implementation deviates from the spec or has incomplete behavior. Listed for reference, not as a plan.

### 1. ~~Change detection is locale-text-only~~ ✅ RESOLVED

Guide-level change detection (`getTourHasAnyChanges`) now compares the currently tracked draft/live pairs: tour settings, tour structure, tour assets, and stop locale text. The badge indicator reflects changes across those aspects, not just tour locale title/description. Per-locale `hasChanges` in the translations manager remains text-only (appropriate for that context).

### 2. Stop status never shows "Changed"

`getStopTranslationStatusDisplay()` has no `hasChanges` parameter. Published stop translations always display as "Up to date" even when the draft differs from published.

### 3. ~~Discard only reverts locale text~~ ✅ RESOLVED

`discardAllTourChanges()` now reverts tour locale text, settings, structure, tour assets, and stop locale text to their published state in a single atomic transaction. It does not revert stop assets or stop settings. `discardAllStopChanges()` does revert locale text, settings, and assets for standalone stops. The confirmation dialog shows context-appropriate text for tours vs stops.

### 4. Unpublish locale doesn't cascade

`unpublishTourLocale()` removes the `tour_locale` row but does not remove corresponding `stop_locale` rows. Stop locale text remains published even after the tour locale is unpublished.

### 5. Archive doesn't remove from structure

`archiveStop()` sets `archivedAt` on the stop entity but does not remove the stop from `tour_stop_draft` or `tour_stop`. The stop remains in the guide structure.

### 6. Preview card archivedAt is hardcoded null

The tour preview card passes `archivedAt: null` to `getTourStatus()`. Archived tours are filtered from the list, so this is functionally correct, but the card component could never display an archived state.

### 7. Preview card uses different field name

The `Tour` display type uses `published` (via zod schema) while the status utility expects `publishedAt`. The preview card maps between them: `tour.published ?? null`.

### 8. Recover sets publishedAt to null even if live rows exist

`recoverTour()` clears both `archivedAt` and `publishedAt`. Published locale/structure/settings/asset rows remain in the live tables but are invisible because `tour.publishedAt` is null. These orphaned live rows are not cleaned up.

### 9. Stop settings are outside the unified tour publish flow

`publishTour()` publishes stop locales and stop assets, but not stop settings. Stop settings still have a separate publish function (`publish-stop-settings.server.ts`) and are not part of the main tour publish flow.

### 10. No "unpublish guide" action (only per-locale)

The spec describes an "Unpublish" action that moves the guide from Published → Unpublished. The current implementation only has per-locale unpublish. Guide-level unpublish happens implicitly when the last locale is unpublished.

### 11. hasPublished gating

`hasPublished` is computed as `tour.publishedAt !== null AND tourLocale row exists`. This means if a guide is published but a specific locale has never been published, that locale shows as "Unpublished" even though the guide is Published. This is correct per the spec's four-level scope model, but can be confusing when viewing translations in the detail page.
