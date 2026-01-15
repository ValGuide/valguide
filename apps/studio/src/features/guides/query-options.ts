import { queryOptions } from '@tanstack/react-query'
import {
  getGuideByNanoIdWithAssetsFn,
  getGuideMetadataFn,
  getGuideTranslationsForLocaleFn,
} from '@valguide/core/features/guides/server-functions'
import type {
  GuideLocaleData,
  GuideMetadata,
  GuideWithStopsAndAssets,
  GuideWithTranslationsAndCover,
} from '@valguide/core/features/guides/types'
import { getArchivedGuidesFn, getGuideByNanoIdFn, getGuidesFn } from './server-functions'

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslationsAndCover[]
  userId: string
}

export const guidesQueryOptions = () =>
  queryOptions<GuideWithTranslationsAndCover[]>({
    queryKey: ['guides'],
    queryFn: () => getGuidesFn({ data: {} }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })

export const guideQueryOptions = (nanoId: string) =>
  queryOptions({
    queryKey: ['guide', nanoId],
    queryFn: async (): Promise<GuideWithStopsAndAssets | null> => {
      try {
        const guide = await getGuideByNanoIdFn({ data: { nanoId } })
        return guide
      } catch (error) {
        if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Not found')) {
          return null
        }
        throw error
      }
    },
    staleTime: 30 * 1000,
  })

export const archivedGuidesQueryOptions = () =>
  queryOptions<ArchivedGuidesResponse>({
    queryKey: ['archived-guides'],
    queryFn: () => getArchivedGuidesFn(),
    staleTime: 30 * 1000,
  })

export const guideWithAssetsQueryOptions = (nanoId: string) =>
  queryOptions({
    queryKey: ['guide-with-assets', nanoId],
    queryFn: () => getGuideByNanoIdWithAssetsFn({ data: { nanoId } }),
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
