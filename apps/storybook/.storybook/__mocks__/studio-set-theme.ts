// Mock for @/features/theme/set-theme (studio app)

export type Theme = 'light' | 'dark' | 'system'

export const setThemeFn = async (): Promise<Theme> => 'system'
