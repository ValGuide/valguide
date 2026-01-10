// Mock for @/features/guides/server-functions (studio app)

export const getGuideByNanoIdFn = async () => null

export const getGuidesFn = async () => []

export const getArchivedGuidesFn = async () => ({
  guides: [],
  userId: 'mock-user-id',
})

export const createGuideFn = async () => ({
  id: 'mock-guide-id',
  nanoId: 'mockguide1',
  organizationId: 'mock-org-id',
  createdBy: 'mock-user-id',
  updatedBy: 'mock-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
})
