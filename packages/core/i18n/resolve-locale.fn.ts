import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { resolveLocaleStateFromHeadersAndUrl } from './locale-resolution'
import { setServerLocale } from './server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const resolveLocaleFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ href: z.string().optional() }))
  .handler(async ({ data }) => {
    const state = resolveLocaleStateFromHeadersAndUrl(getRequestHeaders(), data.href)

    if (state.source === 'query-param') {
      setServerLocale(state.locale)
    }

    return state.locale
  })
