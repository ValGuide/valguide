import { useSuspenseQuery } from '@tanstack/react-query'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { IntlProvider } from '@valguide/core/i18n/provider'
import { messagesQueryOptions } from '@valguide/core/i18n/query-options'
import { Toaster } from '@valguide/ui/components/sonner'
import type { PropsWithChildren } from 'react'

type ProvidersProps = PropsWithChildren<{
  locale: SupportedLocale
}>

export function Providers({ locale, children }: ProvidersProps) {
  const { data: messages } = useSuspenseQuery(messagesQueryOptions(locale))

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
      <Toaster />
    </IntlProvider>
  )
}
