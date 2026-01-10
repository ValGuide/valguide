import { queryOptions } from '@tanstack/react-query'
import type { GuideWithStopsAndAssets, GuideWithTranslationsAndCover } from '@valguide/core/features/guides/types'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { getGuideByNanoIdWithAssetsFn } from '@valguide/core/features/guides/server-functions'
import { getArchivedGuidesFn, getGuideByNanoIdFn, getGuidesFn } from './server-functions'

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslations[]
  userId: string
}

export const guidesQueryOptions = () =>
  queryOptions<GuideWithTranslationsAndCover[]>({
    queryKey: ['guides'],
    queryFn: () => getGuidesFn({ data: {} }),
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
    queryFn: async () => {
      const guide = await getGuideByNanoIdWithAssetsFn({ data: { nanoId } })
      if (!guide) {
        throw new Error('Guide not found')
      }
      return guide
    },
    staleTime: 30 * 1000,
  })
