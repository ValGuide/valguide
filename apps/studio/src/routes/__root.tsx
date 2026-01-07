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
import { getThemeFn } from '@/features/theme/server-functions'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    const [user, locale, theme] = await Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      resolveLocaleFn(),
      getThemeFn(),
    ])
    await context.queryClient.ensureQueryData(messagesQueryOptions(locale))
    return { user, locale, theme }
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
    scripts: [
      {
        // Inline script to prevent FOUC for system theme
        // Runs before React hydrates to apply correct theme immediately
        children: `(function(){var t=document.cookie.match(/valguide-studio-theme=([^;]+)/);if(t&&t[1]==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}})()`,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale, theme } = Route.useRouteContext()
  const resolvedTheme = theme === 'system' ? 'light' : theme

  return (
    <html lang={locale} data-theme={resolvedTheme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers locale={locale} initialTheme={theme}>
          {children}
        </Providers>
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
