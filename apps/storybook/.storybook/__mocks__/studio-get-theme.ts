// Mock for @/features/theme/get-theme (studio app)

export type Theme = 'light' | 'dark' | 'system'

export const getThemeFn = async (): Promise<Theme> => 'system'
