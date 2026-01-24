/**
 * Root server-functions.ts - Re-exports all server functions from subdirectories
 *
 * This file provides backward compatibility. All server functions are now organized in:
 * - guide/server-functions.ts - Guide-related RPC endpoints
 * - stop/server-functions.ts - Stop-related RPC endpoints
 * - translation/server-functions.ts - Translation-related RPC endpoints
 *
 * For new code, prefer importing directly from the specific subdirectory.
 */

// Re-export all guide server functions
export {
  archiveGuideFn,
  deleteGuideFn,
  discardGuideAssetsDraftFn,
  getGuideAssetsByVersionFn,
  getGuideAssetVersionInfoFn,
  getGuideByIdFn,
  getGuideDetailFn,
  getGuideMetadataFn,
  getGuideTranslationsForLocaleFn,
  getGuideViewDataFn,
  publishGuideAssetsFn,
  publishGuideFn,
  recoverGuideFn,
  saveGuideAssetsDraftFn,
  unpublishGuideAssetsFn,
  unpublishGuideFn,
  updateGuideFn,
} from './guide/server-functions'

// Re-export all stop server functions
export {
  createStopFn,
  deleteStopFn,
  discardStopAssetsDraftFn,
  getStopAssetsByVersionFn,
  getStopAssetVersionInfoFn,
  getStopByNanoIdFn,
  hideStopFn,
  publishStopAssetsFn,
  removeStopFromGuideFn,
  reorderStopsFn,
  restoreStopFn,
  saveStopAssetsDraftFn,
  showStopFn,
  unpublishStopAssetsFn,
  updateStopAvailableLocalesFn,
  updateStopByNanoIdFn,
  updateStopFn,
} from './stop/server-functions'

// Re-export all translation server functions
export {
  discardGuideTranslationDraftFn,
  discardStopTranslationDraftFn,
  getGuideTranslationHistoryFn,
  getStopTranslationHistoryFn,
  publishGuideTranslationDraftFn,
  publishStopTranslationDraftFn,
  rollbackGuideTranslationFn,
  rollbackStopTranslationFn,
  unpublishGuideTranslationFn,
  unpublishStopTranslationFn,
  updateGuideTranslationFn,
  updateStopTranslationFn,
} from './translation/server-functions'
