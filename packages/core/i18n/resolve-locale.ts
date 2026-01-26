import { createServerFn } from '@tanstack/react-start'
import { resolveServerLocale } from './server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const resolveLocaleFn = createServerFn({ method: 'GET' }).handler(async () => {
  return resolveServerLocale()
})
