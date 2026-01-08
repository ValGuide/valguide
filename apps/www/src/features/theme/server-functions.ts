import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { type Theme, themeSchema } from '@valguide/core/features/app-theme/types'

const THEME_COOKIE_KEY = 'valguide-www-theme'

export const getThemeFn = createServerFn({ method: 'GET' }).handler(async (): Promise<Theme> => {
  const raw = getCookie(THEME_COOKIE_KEY)
  const result = themeSchema.safeParse(raw)
  return result.success ? result.data : 'system'
})

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
