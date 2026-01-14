import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { logError } from '@valguide/core/utils/log-error'
import { DefaultPending } from './components/default-pending'
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = error instanceof Response ? error.status : (error as any)?.status
          if ([307, 403, 404].includes(status)) {
            return false
          }
          // Optional: limit retries for other errors
          return failureCount < 3
        },
      },
      mutations: {
        retry: (failureCount, error) => {
          const status = error instanceof Response ? error.status : (error as any)?.status
          if ([307, 403, 404].includes(status)) {
            return false
          }
          // Optional: limit retries for other errors
          return failureCount < 3
        },
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
