/**
 * Types for published guide content.
 * Used by the consumer-facing app to display published guides and stops.
 */

import type { Asset } from '../../assets/types'

/**
 * Asset with role/channel info for display purposes.
 * Maps the new channel-based schema to the legacy role-based API.
 */
export interface AssetWithRole extends Asset {
  role: string
  order: number
  locale?: string | null
}

/**
 * Published translation content (title, description).
 */
export interface PublishedTranslation {
  locale: string
  title: string | null
  description: string | null
}

/**
 * Published stop translation content (includes transcription).
 */
export interface PublishedStopTranslation extends PublishedTranslation {
  transcription: string | null
}

/**
 * Stop with its published translations and assets.
 */
export interface StopWithAssets {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  availableLocales: string[]
  translations: PublishedStopTranslation[]
  assets: AssetWithRole[]
}

/**
 * Guide with its published translations, stops, and assets.
 */
export interface GuideWithStopsAndAssets {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  availableLocales: string[]
  translations: PublishedTranslation[]
  assets: AssetWithRole[]
  stops: StopWithAssets[]
}
