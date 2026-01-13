import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import type { AuthUser } from '@valguide/core/features/auth/server-functions'
import { DefaultPending } from './components/default-pending'
import { routeTree } from './routeTree.gen'

declare module '@tanstack/react-router' {
  interface RouteContext {
    user: AuthUser | null
  }
}

// Create a new router instance
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
    defaultPendingComponent: DefaultPending,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
