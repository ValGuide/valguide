import { useSuspenseQuery } from '@tanstack/react-query'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { IntlProvider } from '@valguide/core/i18n/provider'
import { messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { Toaster } from '@valguide/ui/components/sonner'
import type { PropsWithChildren } from 'react'
import { ThemeProvider } from '@/features/theme/theme-provider'
import type { Theme } from '@/features/theme/types'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
  initialTheme: Theme
}>

export function Providers({ locale, initialTheme, children }: ProvidersProps) {
  const { data: messages } = useSuspenseQuery(messagesQueryOptions(locale))

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
        <Toaster />
      </IntlProvider>
    </ThemeProvider>
  )
}
