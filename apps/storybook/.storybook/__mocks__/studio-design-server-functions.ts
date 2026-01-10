// Mock for @/features/design/server-functions (studio app)

export const getThemesFn = async () => []

export const createThemeFn = async () => ({
  id: 'mock-theme-id',
  organizationId: 'mock-org-id',
  name: 'Mock Theme',
  basePreset: 'default',
  colors: {},
  radius: 0.5,
  fonts: {},
  createdBy: 'mock-user-id',
  createdAt: new Date(),
  updatedAt: new Date(),
})

export const updateThemeFn = async () => ({
  id: 'mock-theme-id',
})

export const deleteThemeFn = async () => ({ success: true })
