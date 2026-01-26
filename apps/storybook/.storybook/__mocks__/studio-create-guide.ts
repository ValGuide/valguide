// Mock for @/features/guides/create-guide (studio app)

export const createGuideFn = async () => ({
  id: 'mock-guide-id',
  nanoId: 'mockguide1',
  organizationId: 'mock-org-id',
  createdBy: 'mock-user-id',
  updatedBy: 'mock-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
})
