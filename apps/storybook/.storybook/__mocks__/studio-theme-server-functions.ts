// Mock for @/features/theme/server-functions (studio app)

export type Theme = 'light' | 'dark' | 'system'

export const getThemeFn = async (): Promise<Theme> => 'system'

export const setThemeFn = async (): Promise<Theme> => 'system'
