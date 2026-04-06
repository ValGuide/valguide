/**
 * KV cache types for tour data edge caching.
 *
 * These types represent the JSON-serialized shapes stored in Cloudflare KV.
 * Note: AssetItem Date fields (createdAt, updatedAt) are serialized as ISO strings
 * in KV — the deserializer in kv-serializers.ts revives them back to Date objects.
 */

import type { ThemeConfig } from '../../themes/types'
import type { AssetItem } from './types'

/** A stop embedded within the tour KV blob (locale-scoped). */
export interface StopKvItem {
  nanoId: string
  position: number
  title: string | null
  description: string | null
  transcription: string | null
  assets: AssetItem[]
}

/** Full tour locale KV blob — locale-scoped, with all stops embedded. */
export interface TourKvData {
  nanoId: string
  locale: string
  title: string | null
  description: string | null
  availableLocales: string[]
  stops: StopKvItem[]
  assets: AssetItem[]
  publishedAt: string
}

/** Shared published tour data stored once per tour. */
export interface TourSharedKvData {
  nanoId: string
  theme: ThemeConfig | null
  publishedAt: string
}

/** KV entry for org slug resolution. */
export interface OrgSlugKvEntry {
  nanoId: string
  primarySlug: string
}

/** KV entry for tour slug resolution. */
export interface TourSlugKvEntry {
  tourNanoId: string
  primarySlug: string
  orgPrimarySlug: string
}
