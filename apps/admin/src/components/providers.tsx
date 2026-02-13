import { useSuspenseQuery } from '@tanstack/react-query'
import { ThemeProvider } from '@valguide/core/features/app-theme/theme-provider'
import type { Theme } from '@valguide/core/features/app-theme/types'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { IntlProvider } from '@valguide/core/i18n/provider'
import { messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { PostHogProvider } from '@valguide/core/posthog/PostHogProvider'
import { Toaster } from '@valguide/ui/components/sonner'
import type { PropsWithChildren } from 'react'
import { setThemeFn } from '@/features/theme/set-theme.fn'
import { adminMessagesQueryOptions } from '@/i18n/query-options'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
  initialTheme: Theme
}>

export function Providers({ locale, initialTheme, children }: ProvidersProps) {
  const { data: coreMessages } = useSuspenseQuery(messagesQueryOptions(locale))
  const { data: adminMessages } = useSuspenseQuery(adminMessagesQueryOptions(locale))
  const messages = { ...coreMessages, ...adminMessages }

  return (
    <PostHogProvider>
      <ThemeProvider initialTheme={initialTheme} setThemeFn={setThemeFn}>
        <IntlProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </IntlProvider>
      </ThemeProvider>
    </PostHogProvider>
  )
}
