import { createRouter } from '@tanstack/react-router'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    focusMode?: boolean
  }
}
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { createQueryClient } from '@valguide/core/utils/query-client'
import { DefaultError } from './components/default-error'
import { DefaultNotFound } from './components/default-not-found'
import { DefaultPending } from './components/default-pending'
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
    defaultPendingComponent: DefaultPending,
    defaultErrorComponent: DefaultError,
    defaultNotFoundComponent: DefaultNotFound,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
