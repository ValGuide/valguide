import { queryOptions } from '@tanstack/react-query'
import type { IndependentStopMetadata, StopDetailItem, StopLocaleData } from '@valguide/core/features/guides/types'
import type { StopWithGuides } from './api/fetchers'
import { getStopDetailFn, getStopLocaleDataFn, getStopMetadataFn, getStopsFn } from './server-functions'

/**
 * Query options for stop library list
 */
export const stopsQueryOptions = () =>
  queryOptions<StopWithGuides[]>({
    queryKey: ['stops'],
    queryFn: async () => {
      try {
        const data = await getStopsFn({ data: {} })
        return data as StopWithGuides[]
      } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
          throw new Error('You must be logged in to view stops')
        }
        throw error
      }
    },
    staleTime: 30 * 1000, // 30 seconds
  })

/**
 * Query options for independent stop metadata (for editor shell)
 */
export const stopMetadataQueryOptions = (nanoId: string) =>
  queryOptions<IndependentStopMetadata>({
    queryKey: ['stop', nanoId, 'metadata'],
    queryFn: async () => {
      const data = await getStopMetadataFn({ data: { nanoId } })
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })

/**
 * Query options for stop locale data (per-locale fetching in editor)
 */
export const stopLocaleDataQueryOptions = (stopId: string, locale: string) =>
  queryOptions<StopLocaleData>({
    queryKey: ['stop', stopId, 'locale', locale],
    queryFn: async () => {
      const data = await getStopLocaleDataFn({ data: { stopId, locale } })
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })

/**
 * Query options for stop detail (overview page)
 */
export const stopDetailQueryOptions = (nanoId: string, preferredLocale?: string) =>
  queryOptions<StopDetailItem>({
    queryKey: ['stop', nanoId, 'detail', { preferredLocale }],
    queryFn: async () => {
      const data = await getStopDetailFn({ data: { nanoId, preferredLocale } })
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
