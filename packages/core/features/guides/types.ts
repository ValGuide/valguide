import { z } from 'zod'
import type { Asset } from '../assets/types'
import type { GuideWithStops, GuideWithTranslations, StopWithTranslations } from './schema-types'

// Extended types for app viewer (moved from queries.ts to avoid db.ts import in Storybook)
export type AssetWithRole = Asset & {
  guideAssetId?: string
  stopAssetId?: string
  role: string
  order: number
  locale?: string | null
}

export type StopWithAssets = StopWithTranslations & {
  assets: AssetWithRole[]
}

export type GuideWithStopsAndAssets = Omit<GuideWithStops, 'stops'> & {
  assets: AssetWithRole[]
  stops: StopWithAssets[]
}

export type GuideWithTranslationsAndCover = GuideWithTranslations & {
  coverImage?: AssetWithRole | null
}

export const guideTranslationSchema = z.object({
  id: z.string(),
  guideId: z.string(),
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

export const guideSchema = z.object({
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
  translations: z.array(guideTranslationSchema).optional(),
})

export type GuideTranslation = z.infer<typeof guideTranslationSchema>
export type Guide = z.infer<typeof guideSchema>

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
  assets: AssetWithRole[]
  translationStatuses: TranslationStatus[]
  // Asset versioning pointers
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
}

// Lightweight guide metadata (no translations, for editor shell)
export type GuideMetadata = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  published: Date | null
  createdAt: Date
  updatedAt: Date
  assets: AssetWithRole[]
  stops: StopMetadata[]
  // Guide translation statuses for all locales (just version IDs, no content)
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
export type GuideLocaleData = {
  locale: string
  guideTranslation: {
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

// Guide with all translations for view page (replaces GuideWithStopsAndAssets)
export type GuideTranslationData = {
  id: string
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
  currentVersion: TranslationVersionContent | null
  draftVersion: TranslationVersionContent | null
}

export type GuideViewData = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  published: Date | null
  createdAt: Date
  updatedAt: Date
  assets: AssetWithRole[]
  translations: GuideTranslationData[]
}

// ============================================================================
// Lightweight Guides List Types (optimized for list view)
// ============================================================================

/**
 * Lightweight guide item for list views
 * Contains only data needed for preview cards, with translation fallback applied server-side
 */
export type GuideListItem = {
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
// Lightweight Guide Detail Types (optimized for detail view)
// ============================================================================

/**
 * Translation summary for locale tabs (no full content)
 */
export type TranslationSummary = {
  locale: string
  title: string
}

/**
 * Lightweight guide detail for view page
 * Contains only data needed for detail view, with translation fallback applied server-side
 */
export type GuideDetailItem = {
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
  /** Available locales for this guide (for translations management) */
  availableLocales: string[]
}

// ============================================================================
// Independent Stop Editing Types
// ============================================================================

/**
 * Guide association for a stop (for display in stop overview)
 */
export type StopGuideAssociation = {
  guideId: string
  guideNanoId: string
  position: number
  visible: boolean
  /** Display title resolved from guide translations */
  displayTitle: string
}

/**
 * Independent stop metadata (for stop editor and overview)
 * Similar to GuideMetadata but for a single stop edited independently
 */
export type IndependentStopMetadata = {
  id: string
  nanoId: string
  organizationId: string
  availableLocales: string[]
  createdAt: Date
  updatedAt: Date
  assets: AssetWithRole[]
  translationStatuses: TranslationStatus[]
  /** Asset versioning pointers */
  currentAssetVersionId: string | null
  draftAssetVersionId: string | null
  /** Which guides this stop belongs to */
  guideAssociations: StopGuideAssociation[]
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
  /** Number of guides this stop belongs to */
  guideCount: number
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
  /** Guides this stop belongs to */
  guideAssociations: StopGuideAssociation[]
  /** Assets for this stop */
  assets: AssetWithRole[]
}
