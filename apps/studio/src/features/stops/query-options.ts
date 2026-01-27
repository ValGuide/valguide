import { queryOptions } from '@tanstack/react-query'
import {
  type GetStopAssetsDraftResult,
  getStopAssetsDraftFn,
} from '@valguide/core/features/guides/stop/asset/get-stop-assets-draft.fn'
import { getStopDetailFn, type StopDetail } from '@valguide/core/features/guides/stop/get-stop-detail.fn'
import { listStopsFn, type StopListItem } from '@valguide/core/features/guides/stop/list-stops.fn'
import {
  getStopLocaleDraftFn,
  type StopLocaleDraftResult,
} from '@valguide/core/features/guides/stop/locale/get-stop-locale-draft.fn'

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
  queryOptions<StopDetail>({
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

/**
 * Query options for stop assets draft (all channels)
 */
export const stopAssetsDraftQueryOptions = (nanoId: string) =>
  queryOptions<GetStopAssetsDraftResult>({
    queryKey: ['stop', nanoId, 'assets'],
    queryFn: () => getStopAssetsDraftFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })
