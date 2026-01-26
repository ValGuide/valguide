import { queryOptions } from '@tanstack/react-query'
import { getStopDetailFn, type StopDetail } from '@valguide/core/features/guides/stop/get-stop-detail'
import { listStopsFn, type StopListItem } from '@valguide/core/features/guides/stop/list-stops'
import {
  getStopLocaleDraftFn,
  type StopLocaleDraftResult,
} from '@valguide/core/features/guides/stop/locale/get-stop-locale-draft'

/**
 * Query options for stop library list
 */
export const stopsQueryOptions = (locale: string = 'en') =>
  queryOptions<StopListItem[]>({
    queryKey: ['stops', { locale }],
    queryFn: () => listStopsFn({ data: { locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for stop detail (editor shell)
 * Returns all locales and settings
 */
export const stopDetailQueryOptions = (nanoId: string) =>
  queryOptions<StopDetail | null>({
    queryKey: ['stop', nanoId, 'detail'],
    queryFn: () => getStopDetailFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for stop locale draft (per-locale editing)
 */
export const stopLocaleDraftQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<StopLocaleDraftResult | null>({
    queryKey: ['stop', nanoId, 'locale', locale],
    queryFn: () => getStopLocaleDraftFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })
