'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { PropsWithChildren } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { PropsWithLocale } from '@/utils/types'
import { themes } from '@valguide/ui/theme/themes'

interface ProvidersProps extends PropsWithLocale {
  messages: Record<string, any>
}

export function Providers({ children, locale, messages }: PropsWithChildren<ProvidersProps>) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NextThemesProvider
        attribute="data-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        themes={[...themes]}
      >
        {children}
      </NextThemesProvider>
    </NextIntlClientProvider>
  )
}
