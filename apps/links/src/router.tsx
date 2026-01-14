import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { logError } from '@valguide/core/utils/log-error'
import { routeTree } from './routeTree.gen'

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
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
