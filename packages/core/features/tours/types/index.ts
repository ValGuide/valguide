/**
 * Consolidated types for the tours feature.
 * All public types should be imported from this file.
 *
 * These are pure TypeScript types that don't import from schema.ts,
 * making them safe to import in browser/Storybook environments.
 */

import { z } from 'zod'

import type { Asset } from '../../assets/types'
import type { AssetItem } from '../public/types'

// ============================================================================
// Base Entity Types (Storybook-safe, mirror Drizzle-inferred types)
// ============================================================================

/**
 * Base Tour entity type (mirrors Drizzle-inferred type from schema.ts)
 * For Storybook and client-side use where schema.ts cannot be imported
 */
export interface TourEntity {
  id: string
  nanoId: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  published: Date | null
  organizationId: string
  themeId: string | null
  archivedAt: Date | null
  deletedAt: Date | null
  availableLocales: string[]
}

export interface TourTranslation {
  id: string
  tourId: string
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface TourTranslationVersion {
  id: string
  versionId: string
  translationId: string
  version: number
  title: string | null
  description: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
}

export interface Stop {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
  availableLocales: string[]
  tourId: string | null
  order: number | null
}

export interface TourStop {
  id: string
  tourId: string
  stopId: string
  position: number
  visible: boolean
  archivedAt: Date | null
  createdAt: Date
}

export interface StopTranslation {
  id: string
  stopId: string
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface StopTranslationVersion {
  id: string
  versionId: string
  translationId: string
  version: number
  title: string | null
  description: string | null
  transcription: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
}

// ============================================================================
// Composite Types (with relations)
// ============================================================================

// Helper types with versions
export type TourTranslationWithVersion = TourTranslation & {
  currentVersion?: TourTranslationVersion | null
  draftVersion?: TourTranslationVersion | null
  versions?: TourTranslationVersion[]
}

export type StopTranslationWithVersion = StopTranslation & {
  currentVersion?: StopTranslationVersion | null
  draftVersion?: StopTranslationVersion | null
  versions?: StopTranslationVersion[]
}

export type TourWithTranslations = TourEntity & {
  translations: TourTranslationWithVersion[]
  availableLocales?: string[]
}

export type StopWithTranslations = Stop & {
  translations: StopTranslationWithVersion[]
}

export type TourStopWithStop = TourStop & {
  stop: StopWithTranslations
}

export type TourWithTourStops = TourEntity & {
  translations: TourTranslationWithVersion[]
  tourStops: TourStopWithStop[]
}

export type TourWithStops = TourEntity & {
  translations: TourTranslationWithVersion[]
  stops: StopWithTranslations[]
  availableLocales?: string[]
}

// ============================================================================
// Asset-Related Types
// ============================================================================

/** Re-export AssetItem from public types for consistency */
export type { AssetItem } from '../public/types'

export type StopWithAssets = StopWithTranslations & {
  assets: AssetItem[]
}

export type TourWithStopsAndAssets = Omit<TourWithStops, 'stops'> & {
  assets: AssetItem[]
  stops: StopWithAssets[]
}

export type TourWithTranslationsAndCover = TourWithTranslations & {
  coverImage?: AssetItem | null
}

// ============================================================================
// Zod Schemas (for forms and display/preview components)
// ============================================================================

export const tourTranslationFormSchema = z.object({
  id: z.string(),
  tourId: z.string(),
  locale: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const coverImageSchema = z
  .object({
    storagePath: z.string(),
    publicUrl: z.string().nullable().optional(),
  })
  .nullable()
  .optional()

/**
 * Zod schema for tour display/preview cards.
 * This is NOT the same as the DB entity - it's a view model with resolved fields.
 * Used in preview-card.tsx and similar display components.
 */
export const tourDisplaySchema = z.object({
  id: z.string(),
  nanoId: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  coverImage: coverImageSchema,
  author: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  published: z.date().nullable().optional(),
  tags: z.array(z.string()).optional(),
  translations: z.array(tourTranslationFormSchema).optional(),
})

// Zod-inferred types (for form validation etc.)
export type TourTranslationForm = z.infer<typeof tourTranslationFormSchema>
export type TourDisplay = z.infer<typeof tourDisplaySchema>

// Legacy aliases for backward compatibility
export const tourTranslationSchema = tourTranslationFormSchema
export const tourSchema = tourDisplaySchema
/**
 * @deprecated Use TourDisplay for display/preview components or import Tour from schema.ts for DB entity
 * This is the Zod-inferred display type, kept for backward compatibility with preview-card.tsx
 */
export type Tour = TourDisplay

// ============================================================================
// Lightweight Editor Types (Stage 2 - per-locale fetching)
// ============================================================================

// Lightweight translation status (just version IDs, no content)
export type TranslationStatus = {
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
}

// Minimal stop info for ordering/navigation (no translations)
export type StopMetadata = {
  id: string
  nanoId: string
  position: number
  visible: boolean
  archivedAt: Date | null
  assets: AssetItem[]
  translationStatuses: TranslationStatus[]
  // Asset versioning pointers
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
}

// Lightweight tour metadata (no translations, for editor shell)
export type TourMetadata = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  published: Date | null
  createdAt: Date
  updatedAt: Date
  assets: import('../public/types').AssetItem[]
  stops: StopMetadata[]
  // Tour translation statuses for all locales (just version IDs, no content)
  translationStatuses: TranslationStatus[]
  // Asset versioning pointers
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
}

// Translation version content
export type TranslationVersionContent = {
  id: string
  title: string | null
  description: string | null
}

// Stop translation version content (has transcription)
export type StopTranslationVersionContent = {
  id: string
  title: string | null
  description: string | null
  transcription: string | null
}

// Per-locale bundle for the editor
export type TourLocaleData = {
  locale: string
  tourTranslation: {
    translationId: string
    currentVersionId: string | null
    draftVersionId: string | null
    currentVersion: TranslationVersionContent | null
    draftVersion: TranslationVersionContent | null
  } | null
  stopTranslations: Array<{
    stopId: string
    translationId: string
    currentVersionId: string | null
    draftVersionId: string | null
    currentVersion: StopTranslationVersionContent | null
    draftVersion: StopTranslationVersionContent | null
  }>
}

// Tour with all translations for view page (replaces TourWithStopsAndAssets)
export type TourTranslationData = {
  id: string
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
  currentVersion: TranslationVersionContent | null
  draftVersion: TranslationVersionContent | null
}

export type TourViewData = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  published: Date | null
  createdAt: Date
  updatedAt: Date
  assets: import('../public/types').AssetItem[]
  translations: TourTranslationData[]
}

// ============================================================================
// Lightweight Tours List Types (optimized for list view)
// ============================================================================

/**
 * Lightweight tour item for list views
 * Contains only data needed for preview cards, with translation fallback applied server-side
 */
export type TourListItem = {
  id: string
  nanoId: string
  published: Date | null
  createdAt: Date
  updatedAt: Date
  /** Resolved cover image URL (ImageKit or public URL) */
  coverImageUrl: string | null
  /** Resolved title from best available translation */
  displayTitle: string | null
  /** Resolved description from best available translation */
  displayDescription: string | null
  /** Which locale was used for display (for debugging/UI hints) */
  displayLocale: string
}

// ============================================================================
// Lightweight Tour Detail Types (optimized for detail view)
// ============================================================================

/**
 * Translation summary for locale tabs (no full content)
 */
export type TranslationSummary = {
  locale: string
  title: string
}

/**
 * Lightweight tour detail for view page
 * Contains only data needed for detail view, with translation fallback applied server-side
 */
export type TourDetailItem = {
  id: string
  nanoId: string
  organizationId: string
  published: Date | null
  createdAt: Date
  updatedAt: Date
  /** Resolved cover image URL (ImageKit or public URL) */
  coverImageUrl: string | null
  /** Resolved title from best available translation */
  displayTitle: string | null
  /** Resolved description from best available translation (rich text) */
  displayDescription: string | null
  /** Which locale was used for display */
  displayLocale: string
  /** Summary of all available translations for locale tabs */
  translationSummaries: TranslationSummary[]
  /** Available locales for this tour (for translations management) */
  availableLocales: string[]
}

// ============================================================================
// Independent Stop Editing Types
// ============================================================================

/**
 * Tour association for a stop (for display in stop overview)
 */
export type StopTourAssociation = {
  tourId: string
  tourNanoId: string
  position: number
  visible: boolean
  /** Display title resolved from tour translations */
  displayTitle: string
}

/**
 * Independent stop metadata (for stop editor and overview)
 * Similar to TourMetadata but for a single stop edited independently
 */
export type IndependentStopMetadata = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  createdAt: Date
  updatedAt: Date
  assets: import('../public/types').AssetItem[]
  translationStatuses: TranslationStatus[]
  /** Asset versioning pointers */
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
  /** Which tours this stop belongs to */
  tourAssociations: StopTourAssociation[]
}

/**
 * Per-locale translation data for a single stop (independent editing)
 */
export type StopLocaleData = {
  locale: string
  stopTranslation: {
    translationId: string
    currentVersionId: string | null
    draftVersionId: string | null
    currentVersion: StopTranslationVersionContent | null
    draftVersion: StopTranslationVersionContent | null
  } | null
}

/**
 * Lightweight stop list item (for stop library)
 */
export type StopListItem = {
  id: string
  nanoId: string
  createdAt: Date
  updatedAt: Date
  /** Resolved title from best available translation */
  displayTitle: string
  /** Resolved description from best available translation */
  displayDescription: string | null
  /** Which locale was used for display */
  displayLocale: string
  /** Number of tours this stop belongs to */
  tourCount: number
  /** Translation statuses for all locales */
  translationStatuses: TranslationStatus[]
}

/**
 * Lightweight stop detail for overview page
 */
export type StopDetailItem = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  createdAt: Date
  updatedAt: Date
  /** Resolved title from best available translation */
  displayTitle: string | null
  /** Resolved description from best available translation */
  displayDescription: string | null
  /** Which locale was used for display */
  displayLocale: string
  /** Summary of all available translations for locale tabs */
  translationSummaries: TranslationSummary[]
  /** Tours this stop belongs to */
  tourAssociations: StopTourAssociation[]
  /** Assets for this stop */
  assets: AssetItem[]
}

// ============================================================================
// Stop Detail Types (for stop editor - Storybook-safe)
// ============================================================================

/**
 * Stop locale draft info (mirrors type in get-stop-detail.server.ts)
 */
export type StopLocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  hasPublished: boolean
}

/**
 * Full stop detail type (mirrors type in get-stop-detail.server.ts)
 * Safe for Storybook/browser imports
 */
export type StopDetail = {
  id: string
  nanoId: string
  organizationId: string
  existingLocales: string[]
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: StopLocaleDraftInfo[]
  settings: {
    coordinates: string | null
    settingsJson: string | null
  } | null
}

/**
 * Stop locale draft result (mirrors type in get-stop-locale-draft.server.ts)
 */
export type StopLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  hasPublished: boolean
}

/**
 * Stop locale published result (mirrors type in get-stop-locale-published.server.ts)
 */
export type StopLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  transcription: string | null
  publishedAt: Date | null
}

/**
 * Stop asset draft item (mirrors type in get-stop-assets-draft.server.ts)
 */
export type StopAssetDraftItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

// ============================================================================
// Tour Detail Types (for tour editor - Storybook-safe)
// ============================================================================

/**
 * Tour locale draft info (mirrors type in get-tour-detail.server.ts)
 */
export type LocaleDraftInfo = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
}

/**
 * Full tour detail type (mirrors type in get-tour-detail.server.ts)
 * Safe for Storybook/browser imports
 */
export type TourDetail = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  archivedAt: Date | null
  createdAt: Date
  updatedAt: Date
  locales: LocaleDraftInfo[]
  settings: {
    themeId: string | null
    settingsJson: string | null
  } | null
}

/**
 * Tour locale draft result (mirrors type in get-tour-locale-draft.server.ts)
 */
export type TourLocaleDraftResult = {
  locale: string
  title: string | null
  description: string | null
  hasPublished: boolean
}

/**
 * Tour locale published result (mirrors type in get-tour-locale-published.server.ts)
 */
export type TourLocalePublishedResult = {
  locale: string
  title: string | null
  description: string | null
  publishedAt: Date
}

/**
 * Tour asset draft item (mirrors type in get-tour-assets-draft.server.ts)
 */
export type TourAssetDraftItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  createdAt: Date
}

/**
 * Structure draft stop (mirrors type in get-structure-draft.server.ts)
 */
export type StructureDraftStop = {
  stopId: string
  stopNanoId: string
  position: number
  visible: boolean
  title: string | null
  locale: string
  thumbnailUrl: string | null
}

/**
 * Tour asset published item (mirrors type in get-tour-assets-published.server.ts)
 */
export type TourAssetPublishedItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  publishedAt: Date
}

/**
 * Stop asset published item (mirrors type in get-stop-assets-published.server.ts)
 */
export type StopAssetPublishedItem = {
  id: string
  asset: Asset
  channel: string
  locale: string | null
  position: number
  publishedAt: Date
}

/**
 * Stop tour usage result (mirrors type in get-stop-tour-usage.server.ts)
 */
export type StopTourUsageResult = {
  tourCount: number
  tours: Array<{
    nanoId: string
    title: string | null
  }>
}

/**
 * Archived tour list item (mirrors type in list-archived-tours.server.ts)
 */
export type ArchivedTourListItem = {
  nanoId: string
  title: string | null
  locale: string
  availableLocales: string[]
  archivedAt: Date
  createdAt: Date
  updatedAt: Date
}
