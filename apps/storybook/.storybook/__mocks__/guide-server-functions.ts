// Mock for @valguide/core/features/guides/server-functions
// These mocks replace TanStack Start server functions for Storybook compatibility

export const getGuideByIdFn = async () => null

export const getGuideByNanoIdWithAssetsFn = async () => null

export const getStopByNanoIdFn = async () => null

export const getGuideTranslationHistoryFn = async () => []

export const getStopTranslationHistoryFn = async () => []

export const updateGuideFn = async () => ({ success: true })

export const updateGuideTranslationFn = async () => ({
  success: true,
  versionId: `version-${Date.now()}`,
})

export const createStopFn = async () => ({
  id: `stop-${Date.now()}`,
  guideId: 'guide-1',
  nanoId: `stop${Date.now()}`,
  order: 0,
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-1',
  translations: [],
})

export const updateStopFn = async () => ({ success: true })

export const deleteStopFn = async () => ({ success: true })

export const reorderStopsFn = async () => ({ success: true })

export const attachAssetToGuideFn = async () => ({ success: true })

export const attachAssetToStopFn = async () => ({ success: true })

export const detachAssetFromGuideFn = async () => ({ success: true })

export const detachAssetFromStopFn = async () => ({ success: true })

export const archiveGuideFn = async () => ({ success: true })

export const recoverGuideFn = async () => ({ success: true })

export const deleteGuideFn = async () => ({ success: true })

export const publishGuideTranslationDraftFn = async () => ({ success: true })

export const publishStopTranslationDraftFn = async () => ({ success: true })

export const rollbackGuideTranslationFn = async () => ({ success: true })

export const rollbackStopTranslationFn = async () => ({ success: true })
