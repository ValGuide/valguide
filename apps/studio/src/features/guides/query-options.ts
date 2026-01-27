import { queryOptions } from '@tanstack/react-query'
import type { GetGuideAssetsDraftResult } from '@valguide/core/features/guides/guide/asset/get-guide-assets-draft.fn'
import { getGuideAssetsDraftFn } from '@valguide/core/features/guides/guide/asset/get-guide-assets-draft.fn'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import { getGuideDetailFn } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import type { ArchivedGuideListItem } from '@valguide/core/features/guides/guide/list-archived-guides.fn'
import { listArchivedGuidesFn } from '@valguide/core/features/guides/guide/list-archived-guides.fn'
import type { GuideListItem } from '@valguide/core/features/guides/guide/list-guides.fn'
import { listGuidesFn } from '@valguide/core/features/guides/guide/list-guides.fn'
import type { GuideLocaleDraftResult } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import { getGuideLocaleDraftFn } from '@valguide/core/features/guides/guide/locale/get-guide-locale-draft.fn'
import {
  getStructureDraftFn,
  type StructureDraftResult,
} from '@valguide/core/features/guides/structure/get-structure-draft.fn'

/**
 * Lightweight query options for guides list view
 * Fetches only data needed for preview cards with translation fallback applied server-side
 */
export const guidesListQueryOptions = (preferredLocale: string) =>
  queryOptions<GuideListItem[]>({
    queryKey: ['guides', { locale: preferredLocale }],
    queryFn: () => listGuidesFn({ data: { locale: preferredLocale } }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

export const archivedGuidesQueryOptions = () =>
  queryOptions<ArchivedGuideListItem[]>({
    queryKey: ['archived-guides'],
    queryFn: () => listArchivedGuidesFn(),
    staleTime: 30 * 1000,
  })

/**
 * Query options for guide detail view page (editor shell)
 * Returns all locales and settings
 */
export const guideDetailQueryOptions = (nanoId: string) =>
  queryOptions<GuideDetail>({
    queryKey: ['guide', nanoId, 'detail'],
    queryFn: () => getGuideDetailFn({ data: { nanoId } }),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  })

// ============================================================================
// Per-locale Editor Query Options
// ============================================================================

/**
 * Query options for guide locale draft (per-locale editing)
 */
export const guideLocaleDraftQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<GuideLocaleDraftResult | null>({
    queryKey: ['guide', nanoId, 'locale', locale],
    queryFn: () => getGuideLocaleDraftFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for guide structure draft (stops in guide)
 */
export const guideStructureDraftQueryOptions = (nanoId: string, locale: string) =>
  queryOptions<StructureDraftResult | null>({
    queryKey: ['guide', nanoId, 'structure', { locale }],
    queryFn: () => getStructureDraftFn({ data: { nanoId, locale } }),
    staleTime: 30 * 1000,
  })

/**
 * Query options for guide assets draft (all channels)
 */
export const guideAssetsDraftQueryOptions = (nanoId: string) =>
  queryOptions<GetGuideAssetsDraftResult>({
    queryKey: ['guide', nanoId, 'assets'],
    queryFn: () => getGuideAssetsDraftFn({ data: { nanoId } }),
    staleTime: 30 * 1000,
  })
