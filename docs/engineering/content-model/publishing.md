---
title: "Tour & Stop Publishing in Studio"
---

This document describes the current publishing flow for tours and stops in ValGuide Studio. It is the implementation reference for how drafts, locales, structure, assets, themes, and visibility currently work.

The important takeaway is that the system is still understandable, but the current behavior is a mixed model: some things publish per locale, some publish globally, and shared stop data can affect multiple tours at once.

## Simplest Truthful Model

1. Studio edits draft rows first.
2. Visitors only see live rows.
3. Tour locale publishing is locale-scoped for text, but not for everything else.
4. Tour shared settings publish independently of locale text.
5. Stops are shared content objects, so publishing a stop can affect multiple tours.

## Source Of Truth

| Aspect | Draft storage | Live storage | Scope |
|--------|---------------|--------------|-------|
| Tour visibility | `tour.publishedAt` | `tour.publishedAt` | Per tour |
| Tour text | `tour_locale_draft` | `tour_locale` | Per tour x locale |
| Stop text | `stop_locale_draft` | `stop_locale` | Per stop x locale |
| Tour structure | `tour_stop_draft` | `tour_stop` | Per tour x stop |
| Tour settings | `tour_settings_draft` | `tour_settings` | Per tour |
| Tour theme fallback | none | `organization.defaultThemeId` | Per org |
| Tour assets | `tour_asset_draft` | `tour_asset` | Per tour |
| Stop assets | `stop_asset_draft` | `stop_asset` | Per stop |
| Stop settings | `stop_settings_draft` | `stop_settings` | Per stop |

Important details:

- `tour.publishedAt` is the guide-level visibility flag. A tour is considered unpublished when it is `null`.
- Stops do not have their own `publishedAt` field. A stop is effectively live when it has live rows in `stop_locale` and is included in a published tour structure.
- Workspace default theme is not draft-based. It is stored directly on `organization.defaultThemeId`.
- Tour theme override is draft/live. It lives in `tour_settings_draft.themeId` and `tour_settings.themeId`.

## What Is Per Locale And What Is Global

Per-locale:

- `tour_locale_draft` / `tour_locale`
- `stop_locale_draft` / `stop_locale`
- locale-specific assets when a row itself has a `locale`

Global to the whole tour or stop:

- tour structure
- stop visibility inside a tour
- theme assignment
- cover image
- non-localized assets such as gallery images
- stop assets as a whole when published through the unified tour publish flow

This mixed scope is the main reason the model feels more complex than it should.

## How Drafts Get Created

### Tour Creation

Creating a tour does three things immediately:

- inserts a `tour` row with one initial locale in `availableLocales`
- creates the initial `tour_locale_draft` row
- creates the initial `tour_settings_draft` row

### Stop Creation

Creating a stop does the same at stop level:

- inserts a `stop` row with one initial locale in `availableLocales`
- creates the initial `stop_locale_draft` row
- creates the initial `stop_settings_draft` row

### Opening A Locale Can Create Missing Draft Rows

Both tour and stop draft getters create missing locale draft rows on demand when you open a locale that is allowed but does not yet have a draft record.

### Adding A Locale To A Tour

Adding a locale to a tour does more than just update `tour.availableLocales`.

It also:

- creates a `tour_locale_draft` row for the new locale if needed
- creates `stop_locale_draft` rows for every stop currently in the tour draft structure for that locale if needed

This is why a tour’s language set acts like a project-level locale boundary for stops inside that tour.

### Removing A Locale From A Tour

Removing a locale from a tour is not the same as unpublishing it.

It currently:

- removes the locale from `tour.availableLocales`
- deletes the matching `tour_locale_draft` row

It does not:

- delete `tour_locale` live rows
- delete `stop_locale_draft` rows for existing stops
- delete `stop_locale` live rows

That separation is important when reasoning about bugs and UX.

### Stop Locales In Tour Context

When editing a stop from inside a tour, the locale picker is constrained to the tour’s locales, not the stop’s full standalone locale set. The stop editor still writes to shared stop draft rows.

## What Studio Saves Before Publishing

### Tour Editor

The tour editor does not batch all edits into one big draft save step.

Current behavior:

- saving the form writes only the active tour locale text to `tour_locale_draft`
- changing stop order or stop visibility writes directly to `tour_stop_draft`
- changing the cover image or other tour media writes directly to `tour_asset_draft`
- changing the theme writes directly to `tour_settings_draft`
- editing a stop inside the tour writes directly to shared `stop_locale_draft` and `stop_asset_draft` rows

### Stop Editor

The standalone stop editor behaves similarly:

- saving the form writes the active locale text to `stop_locale_draft`
- changing gallery or audio media writes directly to `stop_asset_draft`

Stop settings are different:

- `stop_settings_draft` and `stop_settings` exist in the schema
- server functions exist for reading, updating, and publishing them
- the current Studio stop editor does not expose a visible end-to-end settings publishing workflow for them

## Publishing Tour Locale Content

Tour locale publishing is the main editor flow. It is triggered from the tour edit page and runs in one transaction.

When you publish a tour in locale `L`, the system currently does this:

1. Upserts `tour_locale_draft(L)` into `tour_locale(L)`.
2. Replaces all live tour structure rows from `tour_stop_draft`.
3. Replaces all live tour asset rows from `tour_asset_draft`.
5. For every stop currently in the draft structure:
   - upserts `stop_locale_draft(L)` into `stop_locale(L)`
   - replaces all live stop asset rows from `stop_asset_draft`
4. Sets `tour.publishedAt = now()`.

What that means in practice:

- the active tour language is published
- all tour structure changes are published
- all current draft tour assets are published
- the active language for each stop in the tour is published
- all current draft stop assets for each stop in the tour are published

What is not included:

- shared tour settings are not part of locale publish anymore
- stop settings are not part of the unified tour publish transaction

### Critical Consequence

Tour publish is not purely “publish this locale”.

Publishing English also republishes:

- tour structure for all visitors
- tour assets for all visitors
- stop assets for every stop in the tour

Only the text parts stay locale-scoped. Structure and non-localized assets remain global to the tour.

## Publishing Shared Tour Settings

Shared tour settings, including theme assignment, publish independently from locale text.

Publishing shared tour settings does this:

1. Upserts `tour_settings_draft` into `tour_settings`.
2. Refreshes the shared published KV entry for the tour if the tour has at least one published locale.

What it does not do:

- publish or republish any `tour_locale`
- publish or republish any `stop_locale`
- change `tour.publishedAt`
- rewrite locale content KV blobs

This keeps the storage model honest:

- locale text publishes per locale
- shared theme/settings publish per tour

## Publishing From The Stop Editor

Standalone stop publishing exists, but it is a separate path from tour publishing.

When you publish from the standalone stop editor:

1. The active stop locale draft is saved if dirty.
2. The active locale is upserted from `stop_locale_draft` into `stop_locale`.
3. The UI separately publishes stop assets for:
   - `images.gallery` with `locale = null`
   - `audio.narration` for the active locale

What it does not touch:

- `tour.publishedAt`
- tour structure
- tour settings
- tour assets
- stop settings

### Stop Publishing Inside A Tour

When a stop is opened from inside a tour, the stop edit page disables publish and unpublish actions. The user can edit drafts there, but visitor-facing publication is expected to happen through the parent tour publish flow.

## Shared Stops And Why They Matter

Stops are shared entities. Their text, assets, and settings are stored per stop, not per tour.

That means:

- publishing a stop locale updates the live stop for every published tour using that stop
- publishing a tour can update shared stop content that is also used elsewhere
- unpublishing a stop locale removes that locale from every published tour using that stop

Tour-specific things remain tour-specific:

- whether the stop is in the tour at all
- its order in the tour
- whether it is visible in that tour

## Themes And Config

Theme resolution has two levels.

## Public KV Model

Published visitor delivery now uses two KV layers:

- locale content: `tour:{nanoId}:{locale}`
- shared tour settings: `tour-shared:{nanoId}`

The locale KV entry contains:

- locale-specific tour title and description
- locale-specific stop text
- tour and stop assets that are still serialized with the locale content payload
- available locales

The shared KV entry contains:

- the resolved published theme for the tour

The public app composes both KV entries at read time. If either KV entry is missing, the app falls back to Postgres and backfills the missing cache entries.

### Workspace Default Theme

- stored directly on `organization.defaultThemeId`
- not draft-based
- changing it does not require republishing tours

### Tour Theme Override

- stored in `tour_settings_draft.themeId`
- published into `tour_settings.themeId`
- when absent, the system falls back to the current workspace default theme
- if there is no org default theme, it falls back to the built-in default theme

Important implication:

- a published tour with no assigned theme can change appearance immediately when the org default theme changes, because the fallback is resolved at read time

## Unpublish Flow

### Unpublish Tour Locale

Unpublishing a tour locale does this:

1. deletes the matching `tour_locale` live row
2. if no live `tour_locale` rows remain, sets `tour.publishedAt = null`

It does not delete:

- live tour structure
- live tour settings
- live tour assets
- live stop locales
- live stop assets

So “tour unpublished” is primarily controlled by the absence of live tour locale rows and the `tour.publishedAt` flag, not by deleting every live row associated with the tour.

### Unpublish Stop Locale

Unpublishing a stop locale deletes the matching `stop_locale` live row and returns the list of tours using that stop. It does not update parent tours.

Because stop content is shared, that locale disappears from every published tour that depends on that stop locale.

## Discard Flow

### Discard All Tour Changes

Discarding a tour resets these draft areas back to live:

- current tour locale text
- tour settings
- tour structure
- tour assets
- current locale stop text for stops in the published structure

It does not reset:

- stop assets
- stop settings

So discard scope does not match publish scope perfectly today.

### Discard All Stop Changes

Discarding a standalone stop resets:

- current stop locale text
- stop settings
- all stop assets

This is broader than the tour-level discard flow for stop-related data.

## What Visitors And Preview Read

### Public Visitor Read Model

Published tour reads use live rows only:

- tour text comes from `tour_locale`
- structure comes from `tour_stop`
- tour assets come from `tour_asset`
- stop text comes from `stop_locale`
- stop assets come from `stop_asset`
- theme comes from `tour_settings`, then org default, then built-in default

The public tour reader also filters `availableLocales` down to locales that are both:

- still listed on the tour
- actually present in live `tour_locale`

### Draft Preview Read Model

Draft preview reads prefer draft rows:

- `tour_locale_draft`
- `tour_stop_draft`
- `tour_asset_draft`
- `tour_settings_draft`
- `stop_locale_draft`
- `stop_asset_draft`

But preview currently falls back to live structure, assets, and theme when draft rows are missing for those aspects.

## Where The Current Complexity Comes From

These are the main pressure points worth simplifying:

- Tour publish mixes locale-scoped text with global structure, settings, tour assets, and shared stop assets.
- `availableLocales`, draft rows, and live rows are three different concepts that can drift apart.
- Locale removal and locale unpublish are separate operations with different effects.
- Shared stops mean one publish can affect multiple tours.
- Tour-level change detection currently checks tour settings, structure, tour assets, and stop locale text, but not stop assets or stop settings.
- Tour-level discard republishes and reverts a different scope than tour-level publish.
- Org default theme changes are immediate runtime changes, not published changes.

## Simplification Direction

If the goal is to make this model easier to explain and safer to operate, the cleanest next decisions are:

- choose one clear ownership boundary for stop publishing
- align publish, discard, and change detection to the same scopes
- make “remove locale” and “unpublish locale” clearly distinct in both docs and UI
- decide whether workspace-default theme changes should be immediate or publish-gated

## Related Documentation

- [Status Model](./status-model.md)
- [Localisation](./localisation.md)
- [Tour Stop Asset Architecture](./tour-stop-asset/architecture.md)
