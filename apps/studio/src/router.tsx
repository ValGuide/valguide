import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import type { AuthUser } from '@valguide/core/features/auth/server-functions'
import { logError } from '@valguide/core/utils/log-error'
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

    queryCache: new QueryCache({
      onError: (error, query) => {
        logError(error, { source: 'query', queryKey: query.queryKey })
      },
    }),

    mutationCache: new MutationCache({
      onError: (error, _, __, mutation) => {
        logError(error, { source: 'mutation', mutationKey: mutation.options.mutationKey })
      },
    }),
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
