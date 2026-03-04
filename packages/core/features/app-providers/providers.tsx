import { useSuspenseQuery } from '@tanstack/react-query'
import { Toaster } from '@valguide/ui/components/sonner'
import type { PropsWithChildren } from 'react'
import type { SupportedLocale } from '../../i18n/i18n.config'
import { IntlProvider } from '../../i18n/provider'
import { messagesQueryOptions } from '../../i18n/query-options'
import { PostHogProvider } from '../../posthog/PostHogProvider'
import { ThemeProvider } from '../app-theme/theme-provider'
import type { Theme } from '../app-theme/types'

type ProvidersProps = PropsWithChildren<{
  app: string
  locale: SupportedLocale
  initialTheme: Theme
  setThemeFn: (args: { data: Theme }) => Promise<Theme>
}>

export function Providers({ app, locale, initialTheme, setThemeFn, children }: ProvidersProps) {
  const { data: messages } = useSuspenseQuery(messagesQueryOptions(locale))
  return (
    <PostHogProvider app={app}>
      <ThemeProvider initialTheme={initialTheme} setThemeFn={setThemeFn}>
        <IntlProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </IntlProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
