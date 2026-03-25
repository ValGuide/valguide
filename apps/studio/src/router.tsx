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
import { routeTree } from './routeTree.gen'

export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    scrollToTopSelectors: ['[data-slot="sidebar-inset"]'],
    defaultPreloadStaleTime: 30_000,
    defaultStaleTime: 30_000,
    // Show pending component after small delay of 150ms
    defaultPendingMs: 150,
    // Minimum time to show pending component to prevent flash (200ms feels instant but smooth)
    defaultPendingMinMs: 200,
    defaultErrorComponent: DefaultError,
    defaultNotFoundComponent: DefaultNotFound,
    // Keep navigation transitions in app-owned page content so global overlays stay stable.
    defaultViewTransition: false,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })

  return router
}
