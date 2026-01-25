import {
  boolean,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { organization } from '../orgs/schema'

/**
 * ValGuide – Final Bulletproof Schema (Locales + Cores + Assets)
 * - _locale = localized publishable unit (guide/stop per locale)
 * - _core = unlocalized publishable unit (guide/stop global attributes)
 * - _draft = single mutable working copy
 * - _version = immutable published snapshots (history)
 * - assets are immutable; only lists are versioned via scopes + set drafts/versions (see assets/schema.ts)
 */

const studioSchema = pgSchema('studio')

// =============================================================================
// Core entities (not versioned)
// =============================================================================


export const guide = studioSchema.table(
  'guide',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_guide_nano_id'),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

    // Operational metadata (not part of content versioning)
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

    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    // Convenience (not lifecycle)
    availableLocales: text('available_locales').array().notNull().default(['en']),
    themeId: uuid('theme_id'),
  },
  (t) => ({
    guideOrgIdx: index('guide_org_idx').on(t.organizationId),
  }),
)

export const stop = studioSchema.table(
  'stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_stop_nano_id'),

    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),

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

    archivedAt: timestamp('archived_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    availableLocales: text('available_locales').array().notNull().default(['en']),
  },
  (t) => ({
    stopOrgIdx: index('stop_org_idx').on(t.organizationId),
  }),
)

// =============================================================================
// Structural relation (not versioned): guide_stop
// =============================================================================

export const guideStop = studioSchema.table(
  'guide_stop',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    position: integer('position').notNull(),
    visible: boolean('visible').notNull().default(true),

    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqGuideStop: uniqueIndex('uniq_guide_stop').on(t.guideId, t.stopId),
    guideIdx: index('guide_stop_guide_idx').on(t.guideId),
    stopIdx: index('guide_stop_stop_idx').on(t.stopId),
  }),
)

// =============================================================================
// TEXT (localized): *_locale + *_locale_draft + *_locale_version
// =============================================================================

export const guideLocale = studioSchema.table(
  'guide_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    // Pointers
    draftId: uuid('draft_id').notNull(), // eager created; FK added via relations
    publishedVersionId: uuid('published_version_id'), // nullable

    // Optional: helps "unpublished changes" without diffing
    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqGuideLocale: uniqueIndex('uniq_guide_locale').on(t.guideId, t.locale),
    guideIdIdx: index('guide_locale_guide_idx').on(t.guideId),
  }),
)

export const guideLocaleDraft = studioSchema.table(
  'guide_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideLocaleId: uuid('guide_locale_id')
      .notNull()
      .references(() => guideLocale.id, { onDelete: 'cascade' }),

    // Draft fields (localized text)
    title: varchar('title', { length: 500 }),
    description: text('description'),

    // Optimistic locking
    revision: integer('revision').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqDraftPerLocale: uniqueIndex('uniq_guide_locale_draft').on(t.guideLocaleId),
    localeIdx: index('guide_locale_draft_locale_idx').on(t.guideLocaleId),
  }),
)

export const guideLocaleVersion = studioSchema.table(
  'guide_locale_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideLocaleId: uuid('guide_locale_id')
      .notNull()
      .references(() => guideLocale.id, { onDelete: 'cascade' }),

    version: integer('version').notNull(), // monotonic per locale

    // Snapshot fields
    title: varchar('title', { length: 500 }),
    description: text('description'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqVersionPerLocale: uniqueIndex('uniq_guide_locale_version').on(t.guideLocaleId, t.version),
    localeIdx: index('guide_locale_version_locale_idx').on(t.guideLocaleId),
  }),
)

export const stopLocale = studioSchema.table(
  'stop_locale',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(),

    draftId: uuid('draft_id').notNull(),
    publishedVersionId: uuid('published_version_id'),

    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqStopLocale: uniqueIndex('uniq_stop_locale').on(t.stopId, t.locale),
    stopIdIdx: index('stop_locale_stop_idx').on(t.stopId),
  }),
)

export const stopLocaleDraft = studioSchema.table(
  'stop_locale_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopLocaleId: uuid('stop_locale_id')
      .notNull()
      .references(() => stopLocale.id, { onDelete: 'cascade' }),

    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    revision: integer('revision').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqDraftPerLocale: uniqueIndex('uniq_stop_locale_draft').on(t.stopLocaleId),
    localeIdx: index('stop_locale_draft_locale_idx').on(t.stopLocaleId),
  }),
)

export const stopLocaleVersion = studioSchema.table(
  'stop_locale_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopLocaleId: uuid('stop_locale_id')
      .notNull()
      .references(() => stopLocale.id, { onDelete: 'cascade' }),

    version: integer('version').notNull(),

    title: varchar('title', { length: 500 }),
    description: text('description'),
    transcription: text('transcription'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqVersionPerLocale: uniqueIndex('uniq_stop_locale_version').on(t.stopLocaleId, t.version),
    localeIdx: index('stop_locale_version_locale_idx').on(t.stopLocaleId),
  }),
)

// =============================================================================
// GLOBAL ATTRIBUTES (unlocalized): *_core + *_core_draft + *_core_version
// =============================================================================

export const guideCore = studioSchema.table(
  'guide_core',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideId: uuid('guide_id')
      .notNull()
      .references(() => guide.id, { onDelete: 'cascade' }),

    draftId: uuid('draft_id').notNull(),
    publishedVersionId: uuid('published_version_id'),

    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqGuideCore: uniqueIndex('uniq_guide_core').on(t.guideId),
    guideIdx: index('guide_core_guide_idx').on(t.guideId),
  }),
)

export const guideCoreDraft = studioSchema.table(
  'guide_core_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideCoreId: uuid('guide_core_id')
      .notNull()
      .references(() => guideCore.id, { onDelete: 'cascade' }),

    // Unlocalized draft fields (examples; adjust as needed)
    // Keep this small and explicit; add JSON later only if necessary.
    // Example: audience tags as string array, duration in seconds, etc.
    audienceTags: text('audience_tags').array(),
    durationSeconds: integer('duration_seconds'),
    difficulty: varchar('difficulty', { length: 50 }),
    settingsJson: text('settings_json'), // optional: JSON string if you want flexibility

    revision: integer('revision').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqDraftPerCore: uniqueIndex('uniq_guide_core_draft').on(t.guideCoreId),
    coreIdx: index('guide_core_draft_core_idx').on(t.guideCoreId),
  }),
)

export const guideCoreVersion = studioSchema.table(
  'guide_core_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    guideCoreId: uuid('guide_core_id')
      .notNull()
      .references(() => guideCore.id, { onDelete: 'cascade' }),

    version: integer('version').notNull(),

    audienceTags: text('audience_tags').array(),
    durationSeconds: integer('duration_seconds'),
    difficulty: varchar('difficulty', { length: 50 }),
    settingsJson: text('settings_json'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqVersionPerCore: uniqueIndex('uniq_guide_core_version').on(t.guideCoreId, t.version),
    coreIdx: index('guide_core_version_core_idx').on(t.guideCoreId),
  }),
)

export const stopCore = studioSchema.table(
  'stop_core',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopId: uuid('stop_id')
      .notNull()
      .references(() => stop.id, { onDelete: 'cascade' }),

    draftId: uuid('draft_id').notNull(),
    publishedVersionId: uuid('published_version_id'),

    lastPublishedDraftRevision: integer('last_published_draft_revision'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    uniqStopCore: uniqueIndex('uniq_stop_core').on(t.stopId),
    stopIdx: index('stop_core_stop_idx').on(t.stopId),
  }),
)

export const stopCoreDraft = studioSchema.table(
  'stop_core_draft',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopCoreId: uuid('stop_core_id')
      .notNull()
      .references(() => stopCore.id, { onDelete: 'cascade' }),

    // Unlocalized draft fields (examples)
    coordinates: varchar('coordinates', { length: 100 }), // e.g. "lat,lng" or replace with numeric columns
    settingsJson: text('settings_json'),

    revision: integer('revision').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    updatedBy: uuid('updated_by').references(() => authUsers.id, { onDelete: 'set null' }),
  },
  (t) => ({
    uniqDraftPerCore: uniqueIndex('uniq_stop_core_draft').on(t.stopCoreId),
    coreIdx: index('stop_core_draft_core_idx').on(t.stopCoreId),
  }),
)

export const stopCoreVersion = studioSchema.table(
  'stop_core_version',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stopCoreId: uuid('stop_core_id')
      .notNull()
      .references(() => stopCore.id, { onDelete: 'cascade' }),

    version: integer('version').notNull(),

    coordinates: varchar('coordinates', { length: 100 }),
    settingsJson: text('settings_json'),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
  },
  (t) => ({
    uniqVersionPerCore: uniqueIndex('uniq_stop_core_version').on(t.stopCoreId, t.version),
    coreIdx: index('stop_core_version_core_idx').on(t.stopCoreId),
  }),
)

// =============================================================================
// Types
// =============================================================================

export type Guide = typeof guide.$inferSelect
export type NewGuide = typeof guide.$inferInsert
export type Stop = typeof stop.$inferSelect
export type NewStop = typeof stop.$inferInsert

export type GuideLocale = typeof guideLocale.$inferSelect
export type GuideLocaleDraft = typeof guideLocaleDraft.$inferSelect
export type GuideLocaleVersion = typeof guideLocaleVersion.$inferSelect

export type StopLocale = typeof stopLocale.$inferSelect
export type StopLocaleDraft = typeof stopLocaleDraft.$inferSelect
export type StopLocaleVersion = typeof stopLocaleVersion.$inferSelect

export type GuideCore = typeof guideCore.$inferSelect
export type GuideCoreDraft = typeof guideCoreDraft.$inferSelect
export type GuideCoreVersion = typeof guideCoreVersion.$inferSelect

export type StopCore = typeof stopCore.$inferSelect
export type StopCoreDraft = typeof stopCoreDraft.$inferSelect
export type StopCoreVersion = typeof stopCoreVersion.$inferSelect

export type GuideStop = typeof guideStop.$inferSelect