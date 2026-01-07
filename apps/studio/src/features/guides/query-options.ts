import { queryOptions } from '@tanstack/react-query'
import type { GuideWithStopsAndAssets } from '@valguide/core/features/guides/queries'
import type { GuideWithTranslations } from '@valguide/core/features/guides/schema'
import { getGuideByNanoIdWithAssetsFn } from '@valguide/core/features/guides/server-functions'
import { getArchivedGuidesFn, getGuideByNanoIdFn, getGuidesFn } from './server-functions'

export interface ArchivedGuidesResponse {
  guides: GuideWithTranslations[]
  userId: string
}

export const guidesQueryOptions = () =>
  queryOptions({
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
  })

export const archivedGuidesQueryOptions = () =>
  queryOptions<ArchivedGuidesResponse>({
    queryKey: ['archived-guides'],
    queryFn: () => getArchivedGuidesFn(),
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
  })
