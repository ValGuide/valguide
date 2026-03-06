import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { resolveLocaleFromHeaders } from './locale-resolution'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const resolveLocaleFn = createServerFn({ method: 'GET' }).handler(async () => {
  return resolveLocaleFromHeaders(getRequestHeaders())
})
