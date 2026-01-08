import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import type { AuthUser } from '@valguide/core/features/auth/server-functions'
import { routeTree } from './routeTree.gen'

declare module '@tanstack/react-router' {
  interface RouteContext {
    user: AuthUser | null
  }
}

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
