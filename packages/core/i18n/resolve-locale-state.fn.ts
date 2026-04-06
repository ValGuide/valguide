import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { resolveLocaleStateFromHeaders } from './locale-resolution'

export const resolveLocaleStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  return resolveLocaleStateFromHeaders(getRequestHeaders())
})
