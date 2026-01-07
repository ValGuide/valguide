import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { resolveLocaleFn } from '@valguide/core/i18n/server-functions'
import { NotFoundPage } from '@valguide/features/404/not-found-page'
import appCss from '@valguide/ui/styles/globals.css?url'
import { Providers } from '@/components/providers'
import { currentUserQueryOptions } from '@/features/auth/query-options'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(currentUserQueryOptions())
    const locale = await resolveLocaleFn()
    await context.queryClient.ensureQueryData(messagesQueryOptions(locale))
    return { user, locale }
  },
  notFoundComponent: () => (
    <NotFoundPage
      i18n={{
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      }}
    />
  ),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/favicon.ico',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale } = Route.useRouteContext()

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'React Query',
              render: <ReactQueryDevtoolsPanel />,
              defaultOpen: false,
            },
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
              defaultOpen: false,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
