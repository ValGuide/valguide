import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { type Theme, themeSchema } from '@valguide/core/features/app-theme/types'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

const THEME_COOKIE_KEY = 'valguide-studio-theme'

export const setThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(themeSchema)
  .handler(async ({ data }: { data: Theme }) => {
    setCookie(THEME_COOKIE_KEY, data, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return data
  })
