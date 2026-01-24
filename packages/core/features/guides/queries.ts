/**
 * Root queries.ts - Re-exports all queries from internal/queries.ts
 *
 * This file provides backward compatibility. All query functions are now in:
 * - internal/queries.ts
 *
 * For new code, prefer importing directly from './internal/queries'.
 */

export {
  createGuide,
  getArchivedGuides,
  getArchivedGuidesWithCover,
  getGuideById,
  getGuideDetailByNanoId,
  getGuideIdByStopNanoId,
  getGuideMetadata,
  getGuideStops,
  getGuidesByOrganizationId,
  getGuidesListByOrganizationId,
  getGuideTranslationsForLocale,
  getGuideViewData,
  getPublishedGuideByNanoId,
  getStopByNanoId,
} from './internal/queries'

// Re-export types for backward compatibility
export type { AssetWithRole, GuideWithStopsAndAssets, GuideWithTranslationsAndCover, StopWithAssets } from './types'
