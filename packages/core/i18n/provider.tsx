import type { ReactNode } from 'react'
import { IntlProvider as UseIntlProvider } from 'use-intl'
import type { SupportedLocale } from './i18n.config'

type IntlProviderProps = {
  locale: SupportedLocale
  messages: Record<string, unknown>
  children: ReactNode
  timeZone?: string
  now?: Date
}

export function IntlProvider({ locale, messages, children, timeZone, now }: IntlProviderProps) {
  return (
    <UseIntlProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      now={now}
      onError={(error) => {
        if (error.code === 'MISSING_MESSAGE' && process.env.NODE_ENV === 'development') {
          throw new Error(`Missing translation: ${error.message}`)
        }
        if (process.env.NODE_ENV === 'development') {
          console.warn('[IntlProvider]', error.message)
        }
      }}
    >
      {children}
    </UseIntlProvider>
  )
}
