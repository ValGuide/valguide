import { Providers } from '@/components/providers'
import { themeQueryOptions } from '@/features/theme/query-options'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { generateThemeScript, resolveTheme } from '@valguide/core/features/themes/defaults'
import { localeQueryOptions, messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { NotFoundPage } from '@valguide/features/404/not-found-page'
import appCss from '@valguide/ui/styles/globals.css?url'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  ssr: true,
  beforeLoad: async ({ context }) => {
    const [locale, theme] = await Promise.all([
      context.queryClient.ensureQueryData(localeQueryOptions()),
      context.queryClient.ensureQueryData(themeQueryOptions()),
    ])
    const messages = await context.queryClient.ensureQueryData(messagesQueryOptions(locale))
    const metadata = {
      title: messages?.studio?.metadata?.title ?? 'Studio - ValGuide',
      description: messages?.studio?.metadata?.description ?? 'Create and design your guides',
    }
    return { locale, theme, metadata }
  },
  notFoundComponent: () => (
    <NotFoundPage
      i18n={{
        title: 'Page Not Found',
        description: 'The page you are looking for does not exist.',
      }}
    />
  ),
  head: ({ match }) => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: match.context.metadata.title,
      },
      {
        name: 'description',
        content: match.context.metadata.description,
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
        children: generateThemeScript('valguide-studio-theme'),
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale, theme } = Route.useRouteContext()
  const resolvedTheme = resolveTheme(theme)

  return (
    <html lang={locale} data-theme={resolvedTheme} suppressHydrationWarning>
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
            hideUntilHover: true,
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
