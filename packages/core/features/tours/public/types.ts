/**
 * Types for published tour content.
 * Used by the consumer-facing app to display published tours and stops.
 */

import type { Asset } from '../../assets/types'
import type { ThemeConfig } from '../../themes/types'

/**
 * Asset with channel info for display purposes.
 * Channels: 'images.hero', 'images.gallery', 'audio.narration'
 */
export interface AssetItem extends Asset {
  channel: string
  position: number
  locale: string | null
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
  assets: AssetItem[]
}

/**
 * Tour with its published translations, stops, and assets.
 */
export interface TourWithStopsAndAssets {
  id: string
  nanoId: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  availableLocales: string[]
  translations: PublishedTranslation[]
  assets: AssetItem[]
  stops: StopWithAssets[]
  theme: ThemeConfig | null
}
