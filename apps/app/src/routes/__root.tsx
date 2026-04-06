import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { generateThemeScript, resolveTheme } from '@valguide/core/features/themes/defaults'
import { defaultLocale } from '@valguide/core/i18n/i18n.config'
import { localeQueryOptions, localeStateQueryOptions, messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { TanStackAppDevtools } from '@valguide/core/ui/components/tanstack-devtools'
import { getPrefixedTitle } from '@valguide/core/utils/page-title'
import { NotFoundPage } from '@valguide/features/404/not-found-page'
import appCss from '@valguide/ui/styles/globals.css?url'
import { Providers } from '@/components/providers'
import { themeQueryOptions } from '@/features/theme/query-options'

const neutralShellStyle = {
  backgroundColor: 'hsl(0 0% 100%)',
  color: 'hsl(240 10% 3.9%)',
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    const [locale, localeState, theme] = await Promise.all([
      context.queryClient.ensureQueryData(localeQueryOptions()),
      context.queryClient.ensureQueryData(localeStateQueryOptions()),
      context.queryClient.ensureQueryData(themeQueryOptions()),
    ])
    const messages = await context.queryClient.ensureQueryData(messagesQueryOptions(locale))
    const metadata = {
      title: messages?.app?.metadata?.title ?? 'ValGuide',
      description: messages?.app?.metadata?.description ?? 'Explore tours',
    }
    return { locale, localeState, theme, messages, metadata }
  },
  notFoundComponent: () => {
    const { messages } = Route.useRouteContext()
    // i18n-used-keys: notFound.title, notFound.description, notFound.homeButton
    return (
      <NotFoundPage
        i18n={{
          title: messages?.notFound?.title ?? 'Page not found',
          description:
            messages?.notFound?.description ??
            "We couldn't find the page you're looking for. It may have been moved or no longer exists.",
          homeButton: messages?.notFound?.homeButton ?? 'Back to Home',
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
        title: getPrefixedTitle(match.context.metadata?.title ?? 'ValGuide'),
      },
      {
        name: 'description',
        content: match.context.metadata?.description ?? 'Explore tours',
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
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
    scripts: [
      {
        children: generateThemeScript('valguide-app-theme'),
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { locale = defaultLocale, theme = 'system' } = Route.useRouteContext()
  const resolvedTheme = resolveTheme(theme)

  return (
    <html lang={locale} data-theme={resolvedTheme} suppressHydrationWarning style={neutralShellStyle}>
      <head>
        <HeadContent />
      </head>
      <body style={neutralShellStyle}>
        <Providers locale={locale} initialTheme={theme}>
          {children}
        </Providers>
        <TanStackAppDevtools />
        <Scripts />
      </body>
    </html>
  )
}
