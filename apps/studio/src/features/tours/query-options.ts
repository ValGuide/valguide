import { queryOptions } from '@tanstack/react-query'
import type { StopLocaleDiffResult } from '@valguide/core/features/tours/stop/locale/compare-stop-locale-diff.fn'
import { compareStopLocaleDiffFn } from '@valguide/core/features/tours/stop/locale/compare-stop-locale-diff.fn'
import {
  getStructureDraftFn,
  type StructureDraftResult,
} from '@valguide/core/features/tours/structure/get-structure-draft.fn'
import type { GetTourAssetsDraftResult } from '@valguide/core/features/tours/tour/asset/get-tour-assets-draft.fn'
import { getTourAssetsDraftFn } from '@valguide/core/features/tours/tour/asset/get-tour-assets-draft.fn'
import type { GetTourAssetsPublishedResult } from '@valguide/core/features/tours/tour/asset/get-tour-assets-published.fn'
import { getTourAssetsPublishedFn } from '@valguide/core/features/tours/tour/asset/get-tour-assets-published.fn'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { getTourDetailFn } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import type { ArchivedTourListItem } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import { listArchivedToursFn } from '@valguide/core/features/tours/tour/list-archived-tours.fn'
import type { TourListItem } from '@valguide/core/features/tours/tour/list-tours.fn'
import { listToursFn } from '@valguide/core/features/tours/tour/list-tours.fn'
import type { TourLocaleDiffResult } from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import { compareTourLocaleDiffFn } from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import type { TourLocaleDraftResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import { getTourLocaleDraftFn } from '@valguide/core/features/tours/tour/locale/get-tour-locale-draft.fn'
import type { TourLocalePublishedResult } from '@valguide/core/features/tours/tour/locale/get-tour-locale-published.fn'
import { getTourLocalePublishedFn } from '@valguide/core/features/tours/tour/locale/get-tour-locale-published.fn'

/**
 * Lightweight query options for tours list view
 * Fetches only data needed for preview cards with translation fallback applied server-side
 */
export const toursListQueryOptions = (preferredLocale: string) =>
  queryOptions<TourListItem[]>({
    queryKey: ['tours', { locale: preferredLocale }],
    queryFn: () => listToursFn({ data: { locale: preferredLocale } }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

export const archivedToursQueryOptions = () =>
  queryOptions<ArchivedTourListItem[]>({
    queryKey: ['archived-tours'],
    queryFn: () => listArchivedToursFn(),
    staleTime: 30 * 1000,
  })

/**
 * Query options for tour detail view page (editor shell)
 * Returns all locales and settings
 */
export const tourDetailQueryOptions = (nanoId: string) =>
  queryOptions<TourDetail>({
    queryKey: ['tour', nanoId, 'detail'],
    queryFn: () => getTourDetailFn({ data: { nanoId } }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

// ============================================================================
// Per-locale Editor Query Options
// ============================================================================

/**
 * Query options for tour locale draft (per-locale editing)
 */
export const tourLocaleDraftQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<TourLocaleDraftResult | null>({
    queryKey: ['tour', nanoId, 'locale', locale, 'draft'],
    queryFn: () => getTourLocaleDraftFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for tour locale published version (per-locale published content)
 * Returns null if locale has never been published
 */
export const tourLocalePublishedQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<TourLocalePublishedResult | null>({
    queryKey: ['tour', nanoId, 'locale', locale, 'published'],
    queryFn: () => getTourLocalePublishedFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for tour structure draft (stops in tour)
 */
export const tourStructureDraftQueryOptions = (nanoId: string) =>
  queryOptions<StructureDraftResult | null>({
    queryKey: ['tour', nanoId, 'structure'],
    queryFn: () => getStructureDraftFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for tour assets draft (all channels)
 */
export const tourAssetsDraftQueryOptions = (nanoId: string) =>
  queryOptions<GetTourAssetsDraftResult>({
    queryKey: ['tour', nanoId, 'assets', 'draft'],
    queryFn: () => getTourAssetsDraftFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for tour assets published (all channels)
 * Returns empty array if tour has never been published
 */
export const tourAssetsPublishedQueryOptions = (nanoId: string) =>
  queryOptions<GetTourAssetsPublishedResult>({
    queryKey: ['tour', nanoId, 'assets', 'published'],
    queryFn: () => getTourAssetsPublishedFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })

// ============================================================================
// Diff Query Options (Draft vs Published comparison)
// ============================================================================

/**
 * Query options for tour locale diff (comparing draft vs published)
 * Returns null if locale doesn't exist
 */
export const tourLocaleDiffQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<TourLocaleDiffResult>({
    queryKey: ['tour', nanoId, 'locale', locale, 'diff'],
    queryFn: () => compareTourLocaleDiffFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for stop locale diff (comparing draft vs published)
 * Returns null if locale doesn't exist
 */
export const stopLocaleDiffQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<StopLocaleDiffResult>({
    queryKey: ['stop', nanoId, 'locale', locale, 'diff'],
    queryFn: () => compareStopLocaleDiffFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })
