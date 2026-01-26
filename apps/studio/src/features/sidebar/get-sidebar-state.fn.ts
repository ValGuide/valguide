import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

// ============================================================================
// SERVER FUNCTION
// ============================================================================

export const getSidebarStateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const sidebarState = getCookie('sidebar_state')
  return sidebarState !== 'false'
})
