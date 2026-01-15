import { queryOptions } from '@tanstack/react-query'
import {
  getGuideMetadataFn,
  getGuideTranslationsForLocaleFn,
  getGuideViewDataFn,
} from '@valguide/core/features/guides/server-functions'
import type {
  GuideListItem,
  GuideLocaleData,
  GuideMetadata,
  GuideViewData,
  GuideWithTranslationsAndCover,
} from '@valguide/core/features/guides/types'
import { getArchivedGuidesFn, getGuidesFn, getGuidesListFn } from './server-functions'

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslationsAndCover[]
  userId: string
}

/**
 * @deprecated Use guidesListQueryOptions for list views - it's optimized and fetches less data
 */
export const guidesQueryOptions = () =>
  queryOptions<GuideWithTranslationsAndCover[]>({
    queryKey: ['guides'],
    queryFn: () => getGuidesFn({ data: {} }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

/**
 * Lightweight query options for guides list view
 * Fetches only data needed for preview cards with translation fallback applied server-side
 */
export const guidesListQueryOptions = (preferredLocale: string) =>
  queryOptions<GuideListItem[]>({
    queryKey: ['guides-list', { preferredLocale }],
    queryFn: () => getGuidesListFn({ data: { preferredLocale } }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

export const archivedGuidesQueryOptions = () =>
  queryOptions<ArchivedGuidesResponse>({
    queryKey: ['archived-guides'],
    queryFn: () => getArchivedGuidesFn(),
    staleTime: 30 * 1000,
  })

/**
 * Query options for guide view page (all translations, no stops)
 * Use for guide detail view that shows all locale translations
 */
export const guideViewQueryOptions = (nanoId: string) =>
  queryOptions<GuideViewData | null>({
    queryKey: ['guide', nanoId, 'view'],
    queryFn: () => getGuideViewDataFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

// ============================================================================
// Lightweight Editor Query Options (Stage 2 - per-locale fetching)
// ============================================================================

/**
 * Query options for guide metadata (no translations)
 * Use for editor shell: guide base data, stops, assets
 */
export const guideMetadataQueryOptions = (nanoId: string) =>
  queryOptions<GuideMetadata | null>({
    queryKey: ['guide', nanoId, 'metadata'],
    queryFn: () => getGuideMetadataFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for guide translations for a single locale
 * Use for editor content: guide + stop translations for active locale only
 */
export const guideLocaleQueryOptions = (guideId: string, locale: string) =>
  queryOptions<GuideLocaleData>({
    queryKey: ['guide', guideId, 'locale', locale],
    queryFn: () => getGuideTranslationsForLocaleFn({ data: { guideId, locale } }),
    staleTime: 30 * 1000,
  })
