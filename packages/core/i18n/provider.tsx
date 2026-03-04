import type { ReactNode } from 'react'
import { IntlProvider as UseIntlProvider } from 'use-intl'
import type { SupportedLocale } from './i18n.config'
import { useMissingMessageTracker } from './use-missing-message-tracker'

type IntlProviderProps = {
  locale: SupportedLocale
  messages: Record<string, unknown>
  children: ReactNode
  timeZone?: string
  now?: Date
}

export function IntlProvider({ locale, messages, children, timeZone, now }: IntlProviderProps) {
  const trackMissingMessage = useMissingMessageTracker({ locale })

  return (
    <UseIntlProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
      now={now}
      onError={(error) => {
        const isDev = (process.env.NODE_ENV as string) === 'development'
        trackMissingMessage(error)

        if (error.code === 'MISSING_MESSAGE' && isDev) {
          throw new Error(`Missing translation: ${error.message}`)
        }
        if (isDev) {
          console.warn('[IntlProvider]', error.message)
        }
      }}
    >
      {children}
    </UseIntlProvider>
  )
}
