import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { generateThemeScript, resolveTheme } from '@valguide/core/features/themes/defaults'
import { defaultLocale } from '@valguide/core/i18n/i18n.config'
import { localeQueryOptions, messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { getPrefixedTitle } from '@valguide/core/utils/page-title'
import { NotFoundPage } from '@valguide/features/404/not-found-page'
import { ErrorPage } from '@valguide/features/error/error-page'
import appCss from '@valguide/ui/styles/globals.css?url'
import { Providers } from '@/components/providers'
import { currentUserQueryOptions } from '@/features/auth/query-options'
import { themeQueryOptions } from '@/features/theme/query-options'
import { adminMessagesQueryOptions } from '@/i18n/query-options'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    const [locale, theme] = await Promise.all([
      context.queryClient.ensureQueryData(localeQueryOptions()),
      context.queryClient.ensureQueryData(themeQueryOptions()),
    ])
    const [user, messages] = await Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(messagesQueryOptions(locale)),
    ])
    const adminMessages = await context.queryClient.ensureQueryData(adminMessagesQueryOptions(locale))
    const metadata = {
      title: adminMessages?.metadata?.title ?? 'Admin - ValGuide',
      description: adminMessages?.metadata?.description ?? 'Manage your ValGuide resources',
    }
    return { user, locale, theme, messages, adminMessages, metadata }
  },
  errorComponent: ({ error }) => {
    const { adminMessages } = Route.useRouteContext()
    return (
      <ErrorPage
        i18n={{
          title: adminMessages?.error?.title ?? 'Something went wrong',
          description:
            adminMessages?.error?.description ??
            'An unexpected error occurred. Please try again or return to the home page.',
          tryAgain: adminMessages?.error?.tryAgain ?? 'Try again',
        }}
        error={error}
        reset={() => window.location.reload()}
      />
    )
  },
  notFoundComponent: () => {
    const { adminMessages } = Route.useRouteContext()
    return (
      <NotFoundPage
        i18n={{
          title: adminMessages?.notFound?.title ?? 'Page not found',
          description:
            adminMessages?.notFound?.description ?? "The page you're looking for doesn't exist or has been moved.",
          homeButton: adminMessages?.notFound?.homeButton ?? 'Go back',
        }}
      />
    )
  },
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
        title: getPrefixedTitle(match.context.metadata?.title ?? 'Admin - ValGuide'),
      },
      {
        name: 'description',
        content: match.context.metadata?.description ?? 'Manage your ValGuide resources',
      },
    ],
    links: [
      {
        rel: 'preload',
        href: '/fonts/noto-sans-latin-wght-normal.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/vollkorn-latin-wght-normal.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
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
        children: generateThemeScript('valguide-admin-theme'),
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale = defaultLocale, theme = 'system' } = Route.useRouteContext()
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
