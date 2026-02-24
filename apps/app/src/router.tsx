import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { createQueryClient } from '@valguide/core/utils/query-client'
import { AppLoadingSkeleton } from './components/app-loading-skeleton'
import { routeTree } from './routeTree.gen'
import { DefaultNotFound } from './components/default-not-found'

export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
    defaultPendingComponent: AppLoadingSkeleton,
    defaultNotFoundComponent: DefaultNotFound
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
