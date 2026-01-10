/**
 * Pure TypeScript type definitions for guides feature.
 * These mirror the Drizzle-inferred types but don't import from schema.ts,
 * making them safe to import in browser/Storybook environments.
 */

export type TranslationStatus = 'draft' | 'in_review' | 'published' | 'archived'

export interface Guide {
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

export interface GuideTranslation {
  id: string
  guideId: string
  locale: string
  currentVersionId: string | null
  draftVersionId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface GuideTranslationVersion {
  id: string
  translationId: string
  version: number
  status: TranslationStatus
  title: string
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
  guideId: string | null
  order: number | null
}

export interface GuideStop {
  id: string
  guideId: string
  stopId: string
  position: number
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
  translationId: string
  version: number
  status: TranslationStatus
  title: string
  description: string | null
  transcription: string | null
  createdAt: Date
  createdBy: string | null
  publishedAt: Date | null
}

// Helper types with versions
export type GuideTranslationWithVersion = GuideTranslation & {
  currentVersion?: GuideTranslationVersion | null
  draftVersion?: GuideTranslationVersion | null
  versions?: GuideTranslationVersion[]
}

export type StopTranslationWithVersion = StopTranslation & {
  currentVersion?: StopTranslationVersion | null
  draftVersion?: StopTranslationVersion | null
  versions?: StopTranslationVersion[]
}

export type GuideWithTranslations = Guide & {
  translations: GuideTranslationWithVersion[]
  availableLocales?: string[]
}

export type StopWithTranslations = Stop & {
  translations: StopTranslationWithVersion[]
}

export type GuideStopWithStop = GuideStop & {
  stop: StopWithTranslations
}

export type GuideWithGuideStops = Guide & {
  translations: GuideTranslationWithVersion[]
  guideStops: GuideStopWithStop[]
}

export type GuideWithStops = Guide & {
  translations: GuideTranslationWithVersion[]
  stops: StopWithTranslations[]
  availableLocales?: string[]
}
