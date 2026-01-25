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
  getGuideDetailFn,
  getGuideMetadataFn,
  getGuideTranslationsForLocaleFn,
  publishGuideAssetsFn,
  recoverGuideFn,
  saveGuideAssetsDraftFn,
  updateGuideFn,
} from './guide/server-functions'

// Re-export all stop server functions
export {
  createStopFn,
  deleteStopFn,
  getStopByNanoIdFn,
  hideStopFn,
  publishStopAssetsFn,
  removeStopFromGuideFn,
  reorderStopsFn,
  saveStopAssetsDraftFn,
  showStopFn,
  updateStopAvailableLocalesFn,
  updateStopByNanoIdFn,
} from './stop/server-functions'

// Re-export all translation server functions
export {
  discardGuideTranslationDraftFn,
  discardStopTranslationDraftFn,
  publishGuideTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishGuideTranslationFn,
  unpublishStopTranslationFn,
  updateGuideTranslationFn,
  updateStopTranslationFn,
} from './translation/server-functions'
