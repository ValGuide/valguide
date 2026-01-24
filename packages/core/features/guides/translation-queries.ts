/**
 * Root translation-queries.ts - Re-exports from translation/internal-queries.ts
 *
 * This file provides backward compatibility. All translation query functions are now in:
 * - translation/internal-queries.ts
 *
 * For new code, prefer importing directly from './translation/internal-queries'.
 */

export type { StopTranslationHistoryResult, TranslationHistoryResult } from './translation/internal-queries'
export {
  getCurrentGuideTranslation,
  getCurrentStopTranslation,
  getDraftGuideTranslation,
  getDraftStopTranslation,
  getGuideTranslationHistory,
  getGuideTranslations,
  getGuideTranslationWithVersions,
  getStopTranslationHistory,
  getStopTranslations,
  getStopTranslationWithVersions,
} from './translation/internal-queries'
