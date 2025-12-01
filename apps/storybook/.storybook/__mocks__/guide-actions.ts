// Mock for @valguide/core/features/guides/actions

export async function attachAssetToStop() {
  return { success: true }
}

export async function createStop() {
  return {
    id: `stop-${Date.now()}`,
    guideId: 'guide-1',
    nanoId: `stop${Date.now()}`,
    order: 0,
    organizationId: 'org-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    translations: [],
  }
}

export async function deleteStop() {
  return { success: true }
}

export async function detachAssetFromStop() {
  return { success: true }
}

export async function reorderStops() {
  return { success: true }
}

export async function updateGuide() {
  return { success: true }
}

export async function updateGuideTranslation() {
  return { success: true, versionId: `version-${Date.now()}` }
}

export async function updateStop() {
  return { success: true }
}
