import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router'
import { generateThemeScript, resolveTheme } from '@valguide/core/features/themes/defaults'
import { defaultLocale } from '@valguide/core/i18n/i18n.config'
import { localeQueryOptions, messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { TanStackAppDevtools } from '@valguide/core/ui/components/tanstack-devtools'
import { getPrefixedTitle } from '@valguide/core/utils/page-title'
import appCss from '@valguide/ui/styles/globals.css?url'
import { Providers } from '@/components/providers'
import { currentUserQueryOptions } from '@/features/auth/query-options'
import { LegalNotFoundPage } from '@/features/legal/legal-not-found-page'
import { themeQueryOptions } from '@/features/theme/query-options'
import { wwwMessagesQueryOptions } from '@/i18n/query-options'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  beforeLoad: async ({ context }) => {
    const [user, locale, theme] = await Promise.all([
      context.queryClient.ensureQueryData(currentUserQueryOptions()),
      context.queryClient.ensureQueryData(localeQueryOptions()),
      context.queryClient.ensureQueryData(themeQueryOptions()),
    ])
    const [messages, wwwMessages] = await Promise.all([
      context.queryClient.ensureQueryData(messagesQueryOptions(locale)),
      context.queryClient.ensureQueryData(wwwMessagesQueryOptions(locale)),
    ])
    // i18n-used-keys: www.metadata.title, www.metadata.description
    const metadata = {
      title: wwwMessages?.www?.metadata?.title ?? 'ValGuide',
      description: wwwMessages?.www?.metadata?.description ?? 'Digital guides for exhibitions and tours',
    }
    return { user, locale, theme, messages, wwwMessages, metadata }
  },
  notFoundComponent: () => {
    const { wwwMessages } = Route.useRouteContext()
    // i18n-used-keys: www.notFound.title, www.notFound.description, www.legal.policies.title, www.legal.privacyPolicy.title, www.legal.termsOfService.title
    return (
      <LegalNotFoundPage
        title={wwwMessages?.www?.notFound?.title ?? 'Page not found'}
        description={wwwMessages?.www?.notFound?.description ?? "We couldn't find the page you were looking for."}
        policiesLabel={wwwMessages?.www?.legal?.policies?.title ?? 'Policies'}
        privacyLabel={wwwMessages?.www?.legal?.privacyPolicy?.title ?? 'Privacy Policy'}
        termsLabel={wwwMessages?.www?.legal?.termsOfService?.title ?? 'Terms of Service'}
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
        content: match.context.metadata?.description ?? 'Digital guides for exhibitions and tours',
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
        children: generateThemeScript('valguide-www-theme'),
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
        <TanStackAppDevtools />
        <Scripts />
      </body>
    </html>
  )
}
