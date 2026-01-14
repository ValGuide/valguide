import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { type Theme, themeSchema } from '@valguide/core/features/app-theme/types'
import { handleError } from '@valguide/core/utils/server-fn-error-handler'

const THEME_COOKIE_KEY = 'valguide-studio-theme'

export const getThemeFn = createServerFn({ method: 'GET' }).handler(
  handleError(async (): Promise<Theme> => {
    const raw = getCookie(THEME_COOKIE_KEY)
    const result = themeSchema.safeParse(raw)
    return result.success ? result.data : 'system'
  }),
)

export const setThemeFn = createServerFn({ method: 'POST' })
  .inputValidator(themeSchema)
  .handler(
    handleError(async ({ data }: { data: Theme }) => {
      setCookie(THEME_COOKIE_KEY, data, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
      return data
    }),
  )
