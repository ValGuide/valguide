/**
 * Root stop-queries.ts - Re-exports all stop queries from stop/internal-queries.ts
 *
 * This file provides backward compatibility. All stop query functions are now in:
 * - stop/internal-queries.ts
 *
 * For new code, prefer importing directly from './stop/internal-queries'.
 */

export {
  createStop,
  getGuideStopsOrdered,
  getStopByNanoId,
  getStopDetailByNanoId,
  getStopMetadataByNanoId,
  getStopsByOrganizationId,
  getStopTranslationForLocale,
} from './stop/internal-queries'
