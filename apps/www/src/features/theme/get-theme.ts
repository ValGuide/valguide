import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { type Theme, themeSchema } from '@valguide/core/features/app-theme/types'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const THEME_COOKIE_KEY = 'valguide-www-theme'

export const getThemeFn = createServerFn({ method: 'GET' }).handler(async (): Promise<Theme> => {
  const raw = getCookie(THEME_COOKIE_KEY)
  const result = themeSchema.safeParse(raw)
  return result.success ? result.data : 'system'
})
