import { createRouter } from '@tanstack/react-router'
import type { AuthUser } from '@valguide/core/features/auth/server-functions'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

declare module '@tanstack/react-router' {
  interface RouteContext {
    user: AuthUser | null
  }
}

// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  })

  return router
}
